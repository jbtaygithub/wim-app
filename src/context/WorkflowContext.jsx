import { createContext, useContext, useState, useCallback } from 'react'
import { createWorkflow, createStep } from '../utils/types'
import { useLocalStorage } from '../hooks/useLocalStorage'

const WorkflowContext = createContext(null)

export function WorkflowProvider({ children }) {
  const { workflows, isLoaded, saveWorkflow, deleteWorkflow, getWorkflow } = useLocalStorage()
  const [currentWorkflow, setCurrentWorkflow] = useState(null)
  const [currentStep, setCurrentStep] = useState('welcome')

  // Start a new workflow
  const startNewWorkflow = useCallback(() => {
    const workflow = createWorkflow()
    setCurrentWorkflow(workflow)
    setCurrentStep('boundaries')
  }, [])

  // Load an existing workflow
  const loadWorkflow = useCallback((id) => {
    const workflow = getWorkflow(id)
    if (workflow) {
      setCurrentWorkflow(workflow)
      setCurrentStep('boundaries')
    }
  }, [getWorkflow])

  // Update current workflow fields
  const updateWorkflow = useCallback((updates) => {
    setCurrentWorkflow((prev) => {
      if (!prev) return prev
      return { ...prev, ...updates }
    })
  }, [])

  // Save current workflow to localStorage
  const persistWorkflow = useCallback(() => {
    if (currentWorkflow) {
      const saved = saveWorkflow(currentWorkflow)
      setCurrentWorkflow(saved)
      return saved
    }
    return null
  }, [currentWorkflow, saveWorkflow])

  // Step management
  const addStep = useCallback(() => {
    setCurrentWorkflow((prev) => {
      if (!prev) return prev
      const newStep = createStep(prev.steps.length + 1)
      return { ...prev, steps: [...prev.steps, newStep] }
    })
  }, [])

  const updateStep = useCallback((stepId, updates) => {
    setCurrentWorkflow((prev) => {
      if (!prev) return prev
      const steps = prev.steps.map((s) =>
        s.id === stepId ? { ...s, ...updates } : s
      )
      return { ...prev, steps }
    })
  }, [])

  const deleteStep = useCallback((stepId) => {
    setCurrentWorkflow((prev) => {
      if (!prev) return prev
      const steps = prev.steps
        .filter((s) => s.id !== stepId)
        .map((s, i) => ({ ...s, order: i + 1 }))
      return { ...prev, steps }
    })
  }, [])

  const reorderSteps = useCallback((fromIndex, toIndex) => {
    setCurrentWorkflow((prev) => {
      if (!prev) return prev
      const steps = [...prev.steps]
      const [moved] = steps.splice(fromIndex, 1)
      steps.splice(toIndex, 0, moved)
      return {
        ...prev,
        steps: steps.map((s, i) => ({ ...s, order: i + 1 })),
      }
    })
  }, [])

  // Navigation
  const goToStep = useCallback((stepId) => {
    setCurrentStep(stepId)
  }, [])

  const goBack = useCallback(() => {
    setCurrentStep('welcome')
    setCurrentWorkflow(null)
  }, [])

  const value = {
    // State
    workflows,
    isLoaded,
    currentWorkflow,
    currentStep,
    // Workflow actions
    startNewWorkflow,
    loadWorkflow,
    updateWorkflow,
    persistWorkflow,
    deleteWorkflow,
    // Step actions
    addStep,
    updateStep,
    deleteStep,
    reorderSteps,
    // Navigation
    goToStep,
    goBack,
  }

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider')
  }
  return context
}
