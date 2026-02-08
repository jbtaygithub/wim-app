import { useState } from 'react'
import { useWorkflow } from '../context/WorkflowContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { Button } from '../components/Button'

function StepEditor({ step, onUpdate, onDelete }) {
  const [tools, setTools] = useState(step.tools.join(', '))

  const handleToolsBlur = () => {
    const toolList = tools
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onUpdate({ tools: toolList })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-4">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
          {step.order}
        </span>
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Step Name *
          </label>
          <input
            type="text"
            value={step.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="What happens in this step?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actor
            </label>
            <input
              type="text"
              value={step.actor}
              onChange={(e) => onUpdate({ actor: e.target.value })}
              placeholder="Who does this?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tools (comma-separated)
            </label>
            <input
              type="text"
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              onBlur={handleToolsBlur}
              placeholder="Excel, Salesforce..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cycle Time (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={step.cycleTime || ''}
              onChange={(e) => onUpdate({ cycleTime: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wait Time (hours)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={step.waitTime || ''}
              onChange={(e) => onUpdate({ waitTime: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`gate-${step.id}`}
            checked={step.isGovernanceGate}
            onChange={(e) => onUpdate({ isGovernanceGate: e.target.checked })}
            className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
          />
          <label htmlFor={`gate-${step.id}`} className="text-sm text-gray-700">
            This is a governance gate (approval, sign-off, checkpoint)
          </label>
        </div>
      </div>
    </div>
  )
}

export function StepBuilderScreen() {
  const { currentWorkflow, addStep, updateStep, deleteStep, reorderSteps } = useWorkflow()
  const [draggedIndex, setDraggedIndex] = useState(null)

  if (!currentWorkflow) return null

  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderSteps(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <ScreenLayout
      title="Map Process Steps"
      subtitle="List each step in your workflow. Drag to reorder."
      nextDisabled={currentWorkflow.steps.length === 0 || currentWorkflow.steps.some(s => !s.name.trim())}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
            <h3 className="font-medium text-gray-900 mb-3">Steps Overview</h3>
            {currentWorkflow.steps.length === 0 ? (
              <p className="text-sm text-gray-500 mb-4">No steps added yet</p>
            ) : (
              <div className="space-y-2 mb-4">
                {currentWorkflow.steps.map((step, index) => (
                  <div
                    key={step.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`
                      flex items-center gap-2 p-2 bg-white rounded border cursor-move
                      ${draggedIndex === index ? 'opacity-50' : ''}
                    `}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                    <span className="text-sm font-medium text-sky-700">{step.order}.</span>
                    <span className="text-sm text-gray-700 truncate flex-1">
                      {step.name || 'Untitled'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={addStep} variant="secondary" className="w-full">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Step
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {currentWorkflow.steps.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No steps yet</h3>
              <p className="text-gray-500 mb-4">Click "Add Step" to start mapping your workflow</p>
              <Button onClick={addStep}>Add First Step</Button>
            </div>
          ) : (
            <>
              {currentWorkflow.steps.map((step) => (
                <StepEditor
                  key={step.id}
                  step={step}
                  onUpdate={(updates) => updateStep(step.id, updates)}
                  onDelete={() => deleteStep(step.id)}
                />
              ))}
              <Button onClick={addStep} variant="secondary" className="w-full">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Step
              </Button>
            </>
          )}
        </div>
      </div>
    </ScreenLayout>
  )
}
