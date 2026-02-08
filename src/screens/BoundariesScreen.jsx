import { useState } from 'react'
import { useWorkflow } from '../context/WorkflowContext'
import { ScreenLayout } from '../components/ScreenLayout'

function TagInput({ label, value, onChange, placeholder }) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      onChange([...value, inputValue.trim()])
      setInputValue('')
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeTag = (index) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="min-h-[42px] p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 bg-white">
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-sky-100 text-sky-700 rounded text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:text-sky-900"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] outline-none text-sm"
          />
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500">Press Enter to add</p>
    </div>
  )
}

export function BoundariesScreen() {
  const { currentWorkflow, updateWorkflow } = useWorkflow()

  if (!currentWorkflow) return null

  return (
    <ScreenLayout
      title="Define Workflow Boundaries"
      subtitle="Set the scope by identifying who's involved and what flows through this process."
      nextDisabled={!currentWorkflow.name.trim()}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Workflow Name *
          </label>
          <input
            type="text"
            value={currentWorkflow.name}
            onChange={(e) => updateWorkflow({ name: e.target.value })}
            placeholder="e.g., Customer Onboarding Process"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TagInput
            label="Suppliers"
            value={currentWorkflow.suppliers}
            onChange={(suppliers) => updateWorkflow({ suppliers })}
            placeholder="Who provides inputs?"
          />
          <TagInput
            label="Customers"
            value={currentWorkflow.customers}
            onChange={(customers) => updateWorkflow({ customers })}
            placeholder="Who receives outputs?"
          />
          <TagInput
            label="Inputs"
            value={currentWorkflow.inputs}
            onChange={(inputs) => updateWorkflow({ inputs })}
            placeholder="What comes in?"
          />
          <TagInput
            label="Outputs"
            value={currentWorkflow.outputs}
            onChange={(outputs) => updateWorkflow({ outputs })}
            placeholder="What goes out?"
          />
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">SIPOC Preview</h3>
          <div className="grid grid-cols-5 gap-2 text-center text-sm">
            <div className="bg-white p-2 rounded border">
              <div className="font-medium text-gray-500 text-xs mb-1">Suppliers</div>
              <div className="text-gray-900">{currentWorkflow.suppliers.length || '-'}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="font-medium text-gray-500 text-xs mb-1">Inputs</div>
              <div className="text-gray-900">{currentWorkflow.inputs.length || '-'}</div>
            </div>
            <div className="bg-sky-50 p-2 rounded border border-sky-200">
              <div className="font-medium text-sky-700 text-xs mb-1">Process</div>
              <div className="text-sky-900 truncate">{currentWorkflow.name || '-'}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="font-medium text-gray-500 text-xs mb-1">Outputs</div>
              <div className="text-gray-900">{currentWorkflow.outputs.length || '-'}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="font-medium text-gray-500 text-xs mb-1">Customers</div>
              <div className="text-gray-900">{currentWorkflow.customers.length || '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}
