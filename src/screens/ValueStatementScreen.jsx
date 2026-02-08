import { useWorkflow } from '../context/WorkflowContext'
import { ScreenLayout } from '../components/ScreenLayout'

export function ValueStatementScreen() {
  const { currentWorkflow, updateWorkflow } = useWorkflow()

  if (!currentWorkflow) return null

  const template = '[Customer] needs [outcome] to [decision/action]'

  return (
    <ScreenLayout
      title="Customer Value Statement"
      subtitle="Define the value this workflow delivers from the customer's perspective."
    >
      <div className="space-y-6">
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
          <h3 className="text-sm font-medium text-sky-800 mb-1">Template</h3>
          <p className="text-sky-700 font-mono text-sm">{template}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Value Statement
          </label>
          <textarea
            value={currentWorkflow.customerValueStatement}
            onChange={(e) => updateWorkflow({ customerValueStatement: e.target.value })}
            placeholder="e.g., The sales team needs qualified leads with complete contact info to prioritize outreach and close deals faster."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Why this matters</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Helps classify which steps truly add value (VA)</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Identifies steps that exist only for internal reasons (BVA)</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Exposes waste that should be eliminated (NVA)</span>
            </li>
          </ul>
        </div>
      </div>
    </ScreenLayout>
  )
}
