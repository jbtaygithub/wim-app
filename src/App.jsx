import { WorkflowProvider, useWorkflow } from './context/WorkflowContext'
import { StepNav } from './components/StepNav'
import {
  WelcomeScreen,
  BoundariesScreen,
  ValueStatementScreen,
  StepBuilderScreen,
  ValueClassifierScreen,
  AIScorerScreen,
  ReviewScreen,
} from './screens'

function AppContent() {
  const { currentStep } = useWorkflow()

  const screens = {
    'welcome': WelcomeScreen,
    'boundaries': BoundariesScreen,
    'value-statement': ValueStatementScreen,
    'step-builder': StepBuilderScreen,
    'value-classifier': ValueClassifierScreen,
    'ai-scorer': AIScorerScreen,
    'review': ReviewScreen,
  }

  const Screen = screens[currentStep] || WelcomeScreen

  return (
    <div className="min-h-screen bg-white">
      <StepNav />
      <Screen />
    </div>
  )
}

function App() {
  return (
    <WorkflowProvider>
      <AppContent />
    </WorkflowProvider>
  )
}

export default App
