// Data model factory functions

export const createWorkflow = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  suppliers: [],
  customers: [],
  inputs: [],
  outputs: [],
  customerValueStatement: '',
  steps: [],
  ...overrides,
})

export const createStep = (order, overrides = {}) => ({
  id: crypto.randomUUID(),
  order,
  name: '',
  actor: '',
  tools: [],
  cycleTime: 0,
  waitTime: 0,
  isGovernanceGate: false,
  valueClass: null, // 'VA' | 'BVA' | 'NVA'
  aiOpportunity: null, // 'high' | 'medium' | 'low'
  ...overrides,
})

// Navigation steps
export const NAV_STEPS = [
  { id: 'welcome', label: 'Welcome', number: null },
  { id: 'boundaries', label: 'Define Boundaries', number: 1 },
  { id: 'value-statement', label: 'Customer Value', number: 2 },
  { id: 'step-builder', label: 'Map Steps', number: 3 },
  { id: 'value-classifier', label: 'Classify Value', number: 4 },
  { id: 'ai-scorer', label: 'AI Opportunity', number: 5 },
  { id: 'review', label: 'Review & Export', number: 6 },
]

// Value class colors
export const VALUE_COLORS = {
  VA: { bg: '#d1fae5', border: '#10b981', text: '#065f46', label: 'Value-Add' },
  BVA: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', label: 'Business Value-Add' },
  NVA: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', label: 'Non Value-Add' },
}

// AI opportunity colors
export const AI_COLORS = {
  high: { bg: '#ede9fe', border: '#7c3aed', text: '#5b21b6' },
  medium: { bg: '#e0e7ff', border: '#6366f1', text: '#4338ca' },
  low: { bg: '#f3f4f6', border: '#9ca3af', text: '#4b5563' },
}
