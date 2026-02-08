import { useWorkflow } from '../context/WorkflowContext'
import { Button } from '../components/Button'

export function WelcomeScreen() {
  const { workflows, isLoaded, startNewWorkflow, loadWorkflow, deleteWorkflow } = useWorkflow()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <img
            src="/logo.png"
            alt="AIPM Logo"
            className="h-36 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Workflow Intelligence Map
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Visualize your workflows, identify waste, and discover AI opportunities
            to optimize your processes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" onClick={startNewWorkflow}>
            Create New Workflow
          </Button>
        </div>

        {workflows.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Saved Workflows
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="flex items-center justify-between p-4 hover:bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {workflow.name || 'Untitled Workflow'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {workflow.steps.length} steps · Updated{' '}
                      {new Date(workflow.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => loadWorkflow(workflow.id)}
                    >
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this workflow?')) {
                          deleteWorkflow(workflow.id)
                        }
                      }}
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
