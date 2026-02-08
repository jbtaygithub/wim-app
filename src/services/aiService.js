import { getApiKey } from '../components/SettingsModal'

export async function getAISuggestions(workflow) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('API key not configured')
  }

  const stepsText = workflow.steps.map((step) =>
    `${step.order}. ${step.name} | Actor: ${step.actor || 'Not specified'} | Tools: ${step.tools.length > 0 ? step.tools.join(', ') : 'None'} | Cycle: ${step.cycleTime || 0}min | Wait: ${step.waitTime || 0}h | Gate: ${step.isGovernanceGate ? 'Yes' : 'No'} | Value: ${step.valueClass || 'Not classified'}`
  ).join('\n')

  const prompt = `You are analyzing a workflow for AI automation opportunities.

Workflow: ${workflow.name || 'Unnamed workflow'}
Customer Value Statement: ${workflow.customerValueStatement || 'Not provided'}

For each step below, score the AI opportunity as High, Medium, or Low based on:
- High: Repetitive, rule-based, clean data available, minimal judgment, errors easily recoverable
- Medium: Some structure, AI can assist but human reviews, moderate judgment needed
- Low: High variability, requires significant judgment, relationship nuance, high stakes errors

Steps:
${stepsText}

Respond in JSON format only:
{
  "suggestions": [
    {"step": 1, "score": "High|Medium|Low", "reason": "Brief 10-15 word explanation"},
    ...
  ]
}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      if (response.status === 401) {
        throw new Error('AI scoring failed. Check your API key and try again.')
      }
      throw new Error(error.error?.message || 'AI scoring failed. Check your API key and try again.')
    }

    const data = await response.json()
    const content = data.content[0]?.text

    if (!content) {
      throw new Error('AI scoring failed. Check your API key and try again.')
    }

    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format')
      }
      const parsed = JSON.parse(jsonMatch[0])

      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        throw new Error('Invalid response format')
      }

      return parsed.suggestions.map(s => ({
        stepOrder: s.step,
        score: s.score.toLowerCase(),
        reason: s.reason
      }))
    } catch {
      throw new Error('AI scoring failed. Invalid response format.')
    }
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('AI scoring timed out. Please try again.')
    }
    throw err
  }
}
