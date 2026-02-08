import { Button } from './Button'
import { useWorkflow } from '../context/WorkflowContext'
import { NAV_STEPS } from '../utils/types'

export function ScreenLayout({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  backLabel = 'Back',
  showBack = true,
  showNext = true,
  nextDisabled = false,
}) {
  const { currentStep, goToStep, goBack, persistWorkflow } = useWorkflow()

  const currentIndex = NAV_STEPS.findIndex((s) => s.id === currentStep)
  const prevStep = NAV_STEPS[currentIndex - 1]
  const nextStep = NAV_STEPS[currentIndex + 1]

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (prevStep) {
      if (prevStep.id === 'welcome') {
        goBack()
      } else {
        goToStep(prevStep.id)
      }
    }
  }

  const handleNext = () => {
    persistWorkflow()
    if (onNext) {
      onNext()
    } else if (nextStep) {
      goToStep(nextStep.id)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-gray-600">{subtitle}</p>
          )}
        </div>

        <div className="flex-1">
          {children}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between">
          {showBack ? (
            <Button variant="ghost" onClick={handleBack}>
              {backLabel}
            </Button>
          ) : (
            <div />
          )}
          {showNext && (
            <Button onClick={handleNext} disabled={nextDisabled}>
              {nextLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
