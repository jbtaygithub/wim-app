export async function getAISuggestions(workflow) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const endpoint = "https://wim-ai-suggestions.jasonbtaylorhome.workers.dev/api/ai-suggestions";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`AI scoring failed (${response.status}). ${errText.slice(0, 300)}`);
    }

    const data = await response.json();
    if (!data?.suggestions || !Array.isArray(data.suggestions)) {
      throw new Error("AI scoring failed. Invalid response format.");
    }

    return data.suggestions;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("AI scoring timed out. Please try again.");
    }
    throw err;
  }
}
