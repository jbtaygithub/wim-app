import { useState, useEffect } from 'react'
import { NAV_STEPS } from '../utils/types'
import { useWorkflow } from '../context/WorkflowContext'
import { SettingsModal } from './SettingsModal'

export function StepNav() {
  const { currentStep, goToStep, currentWorkflow } = useWorkflow()
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const handleOpenSettings = () => setShowSettings(true)
    window.addEventListener('openSettings', handleOpenSettings)
    return () => window.removeEventListener('openSettings', handleOpenSettings)
  }, [])

  // Don't show nav on welcome screen (it has its own larger logo)
  if (currentStep === 'welcome') return null

  const currentIndex = NAV_STEPS.findIndex((s) => s.id === currentStep)

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => goToStep('welcome')}
              className="shrink-0 hover:opacity-80 transition-opacity"
              title="Back to Welcome"
            >
              <img
                src="/logo.png"
                alt="AIPM Logo"
                className="h-14 w-auto"
              />
            </button>
            <h2 className="text-sm font-medium text-gray-500 flex-1">
              {currentWorkflow?.name || 'New Workflow'}
            </h2>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        <div className="flex items-center gap-1">
          {NAV_STEPS.filter((s) => s.number !== null).map((step, index) => {
            const isActive = step.id === currentStep
            const isPast = index < currentIndex - 1
            const isFuture = index > currentIndex - 1

            return (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${isActive ? 'bg-sky-700 text-white' : ''}
                  ${isPast ? 'bg-sky-100 text-sky-700 hover:bg-sky-200' : ''}
                  ${isFuture ? 'bg-gray-100 text-gray-400' : ''}
                `}
              >
                <span className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-xs
                  ${isActive ? 'bg-white text-sky-700' : ''}
                  ${isPast ? 'bg-sky-700 text-white' : ''}
                  ${isFuture ? 'bg-gray-300 text-gray-500' : ''}
                `}>
                  {step.number}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
    <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
  </>
  )
}
