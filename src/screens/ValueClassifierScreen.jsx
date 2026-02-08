import { useWorkflow } from '../context/WorkflowContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { VALUE_COLORS } from '../utils/types'

function ValueCard({ step, onSelect }) {
  const valueClass = step.valueClass

  return (
    <div
      className="bg-white border rounded-lg p-4"
      style={{
        borderColor: valueClass ? VALUE_COLORS[valueClass].border : '#e5e7eb',
        backgroundColor: valueClass ? VALUE_COLORS[valueClass].bg : 'white',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-sm font-medium text-gray-500">Step {step.order}</span>
          <h3 className="font-medium text-gray-900">{step.name}</h3>
          {step.actor && (
            <p className="text-sm text-gray-600">Actor: {step.actor}</p>
          )}
        </div>
        {step.isGovernanceGate && (
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
            Gate
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {Object.entries(VALUE_COLORS).map(([key, colors]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`
              flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
              ${valueClass === key
                ? 'ring-2 ring-offset-2'
                : 'hover:opacity-80'
              }
            `}
            style={{
              backgroundColor: colors.border,
              color: 'white',
              '--tw-ring-color': colors.border,
            }}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ValueClassifierScreen() {
  const { currentWorkflow, updateStep } = useWorkflow()

  if (!currentWorkflow) return null

  const classified = currentWorkflow.steps.filter((s) => s.valueClass).length
  const total = currentWorkflow.steps.length

  return (
    <ScreenLayout
      title="Classify Value"
      subtitle="For each step, decide if it adds value from the customer's perspective."
      nextDisabled={classified < total}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: {classified} of {total} classified
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-600 transition-all"
            style={{ width: `${(classified / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg" style={{ backgroundColor: VALUE_COLORS.VA.bg }}>
          <h4 className="font-medium" style={{ color: VALUE_COLORS.VA.text }}>
            VA - Value Add
          </h4>
          <p className="text-sm" style={{ color: VALUE_COLORS.VA.text }}>
            Customer would pay for this
          </p>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: VALUE_COLORS.BVA.bg }}>
          <h4 className="font-medium" style={{ color: VALUE_COLORS.BVA.text }}>
            BVA - Business Value Add
          </h4>
          <p className="text-sm" style={{ color: VALUE_COLORS.BVA.text }}>
            Required internally (compliance, etc.)
          </p>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: VALUE_COLORS.NVA.bg }}>
          <h4 className="font-medium" style={{ color: VALUE_COLORS.NVA.text }}>
            NVA - Non Value Add
          </h4>
          <p className="text-sm" style={{ color: VALUE_COLORS.NVA.text }}>
            Waste - eliminate if possible
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {currentWorkflow.steps.map((step) => (
          <ValueCard
            key={step.id}
            step={step}
            onSelect={(valueClass) => updateStep(step.id, { valueClass })}
          />
        ))}
      </div>
    </ScreenLayout>
  )
}
