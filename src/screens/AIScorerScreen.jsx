import { useState, useEffect } from 'react'
import { useWorkflow } from '../context/WorkflowContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { Button } from '../components/Button'
import { VALUE_COLORS } from '../utils/types'
import { getApiKey } from '../components/SettingsModal'
import { getAISuggestions } from '../services/aiService'

function AICard({ step, onSelect, aiSuggestion }) {
  const opportunity = step.aiOpportunity

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex gap-4">
        {/* Left side - Step info and scoring buttons */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-500">Step {step.order}</span>
                {step.valueClass && (
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: VALUE_COLORS[step.valueClass].bg,
                      color: VALUE_COLORS[step.valueClass].text,
                    }}
                  >
                    {step.valueClass}
                  </span>
                )}
              </div>
              <h3 className="font-medium text-gray-900">{step.name}</h3>
              {step.actor && (
                <p className="text-sm text-gray-600">Actor: {step.actor}</p>
              )}
              {step.tools.length > 0 && (
                <p className="text-sm text-gray-500">
                  Tools: {step.tools.join(', ')}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {(['high', 'medium', 'low']).map((level) => {
              const isSelected = opportunity === level
              return (
                <button
                  key={level}
                  onClick={() => onSelect(level)}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all
                    ${isSelected
                      ? 'ring-2 ring-offset-2 ring-purple-600'
                      : 'hover:bg-gray-300'
                    }
                  `}
                  style={{
                    backgroundColor: isSelected ? '#7c3aed' : '#e5e7eb',
                    color: isSelected ? 'white' : '#374151',
                  }}
                >
                  {level}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right side - AI Suggestion */}
        {aiSuggestion && (
          <div className="w-48 shrink-0 bg-sky-50 rounded-lg p-3 border border-sky-100">
            <div className="flex items-center gap-1 mb-1">
              <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs font-medium text-sky-600 uppercase">AI Suggestion</span>
            </div>
            <p className="font-bold text-gray-900 capitalize">
              AI: {aiSuggestion.score}
            </p>
            <p className="text-xs text-gray-600 italic mt-1">
              {aiSuggestion.reason}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function AIScorerScreen() {
  const { currentWorkflow, updateStep } = useWorkflow()
  const [hasApiKey, setHasApiKey] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [aiSuggestions, setAiSuggestions] = useState({})

  useEffect(() => {
    const checkApiKey = () => setHasApiKey(!!getApiKey())
    checkApiKey()
    window.addEventListener('apiKeyChanged', checkApiKey)
    return () => window.removeEventListener('apiKeyChanged', checkApiKey)
  }, [])

  const handleGetSuggestions = async () => {
    // Clear previous suggestions
    setAiSuggestions({})
    setIsAnalyzing(true)
    setError(null)

    try {
      const suggestions = await getAISuggestions(currentWorkflow)
      const newSuggestions = {}
      suggestions.forEach((suggestion) => {
        const step = currentWorkflow.steps.find((s) => s.order === suggestion.stepOrder)
        if (step) {
          // Auto-select the AI's suggested score
          updateStep(step.id, { aiOpportunity: suggestion.score })
          newSuggestions[step.id] = {
            score: suggestion.score,
            reason: suggestion.reason
          }
        }
      })
      setAiSuggestions(newSuggestions)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!currentWorkflow) return null

  const scored = currentWorkflow.steps.filter((s) => s.aiOpportunity).length
  const total = currentWorkflow.steps.length

  return (
    <ScreenLayout
      title="Score AI Opportunity"
      subtitle="Evaluate each step's potential for AI/automation."
      nextDisabled={scored < total}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: {scored} of {total} scored
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 transition-all"
            style={{ width: `${(scored / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-purple-900 mb-2">Scoring Guide</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-purple-800">High</span>
            <p className="text-purple-700">
              Repetitive, rule-based, high volume, data entry, document processing
            </p>
          </div>
          <div>
            <span className="font-medium text-purple-800">Medium</span>
            <p className="text-purple-700">
              Semi-structured, some judgment needed, could use AI assistance
            </p>
          </div>
          <div>
            <span className="font-medium text-purple-800">Low</span>
            <p className="text-purple-700">
              Creative, complex judgment, relationship-dependent, strategic
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-purple-200">
          {hasApiKey ? (
            <Button
              onClick={handleGetSuggestions}
              disabled={isAnalyzing}
              className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Get AI Suggestions
                </>
              )}
            </Button>
          ) : (
            <button
              onClick={() => {
                const event = new CustomEvent('openSettings')
                window.dispatchEvent(event)
              }}
              className="text-sm text-purple-700 hover:text-purple-900 underline"
            >
              Set API Key in Settings to enable AI suggestions
            </button>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {currentWorkflow.steps.map((step) => (
          <AICard
            key={step.id}
            step={step}
            aiSuggestion={aiSuggestions[step.id]}
            onSelect={(aiOpportunity) => updateStep(step.id, { aiOpportunity })}
          />
        ))}
      </div>
    </ScreenLayout>
  )
}
