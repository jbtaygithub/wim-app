import { useState, useEffect } from 'react'

const STORAGE_KEY = 'wim-workflows'

export function useLocalStorage() {
  const [workflows, setWorkflows] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setWorkflows(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Failed to load workflows:', err)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever workflows change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows))
      } catch (err) {
        console.error('Failed to save workflows:', err)
      }
    }
  }, [workflows, isLoaded])

  const saveWorkflow = (workflow) => {
    const updated = { ...workflow, updatedAt: new Date().toISOString() }
    setWorkflows((prev) => {
      const existing = prev.findIndex((w) => w.id === workflow.id)
      if (existing >= 0) {
        const newList = [...prev]
        newList[existing] = updated
        return newList
      }
      return [...prev, updated]
    })
    return updated
  }

  const deleteWorkflow = (id) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id))
  }

  const getWorkflow = (id) => {
    return workflows.find((w) => w.id === id) || null
  }

  return {
    workflows,
    isLoaded,
    saveWorkflow,
    deleteWorkflow,
    getWorkflow,
  }
}
