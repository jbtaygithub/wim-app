import { useRef, useState } from 'react'
import { useWorkflow } from '../context/WorkflowContext'
import { ScreenLayout } from '../components/ScreenLayout'
import { Button } from '../components/Button'
import { VALUE_COLORS, AI_COLORS } from '../utils/types'

function MetricCard({ label, value, subtext, color = 'sky' }) {
  const colors = {
    sky: 'bg-sky-50 border-sky-200 text-sky-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  }

  return (
    <div className={`p-4 rounded-lg border ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium">{label}</div>
      {subtext && <div className="text-xs opacity-75">{subtext}</div>}
    </div>
  )
}

function WorkflowMap({ steps }) {
  const stepsPerRow = 4
  const stepBoxWidth = 150 // px - fixed width for all boxes
  const stepBoxHeight = 80 // px - fixed height for consistent vertical centering
  const connectorWidth = 38 // px - width of connector including margins
  const startLabelWidth = 85 // px - START label + connector

  // Group steps into rows - all rows flow left to right
  const rows = []
  for (let i = 0; i < steps.length; i += stepsPerRow) {
    rows.push(steps.slice(i, i + stepsPerRow))
  }

  // Horizontal connecting line between steps (with arrow pointing right)
  const HorizontalConnector = () => (
    <div className="flex items-center shrink-0 mx-1">
      <div className="w-6 h-0.5 bg-gray-400"></div>
      <div
        className="w-0 h-0"
        style={{
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderLeft: '8px solid #9ca3af',
        }}
      ></div>
    </div>
  )

  // Wrap connector: goes down from RIGHT side of last step, across to the left, then down to first step of next row
  const WrapConnector = ({ previousRowSteps }) => {
    // Calculate where the RIGHT edge of the last step box is
    // Row 1: START label + (N steps * step width) + ((N-1) connectors * connector width)
    const lastStepRightEdge = startLabelWidth + (previousRowSteps * stepBoxWidth) + ((previousRowSteps - 1) * connectorWidth)

    // The vertical line should drop from the center of the last step's right edge
    const dropLineX = lastStepRightEdge - (stepBoxWidth / 2)

    // The left side where the line connects to next row (aligned with Step 1, which is after START label)
    const leftSideX = startLabelWidth + (stepBoxWidth / 2)

    return (
      <div className="relative h-12 w-full my-1">
        {/* Vertical line down from center-right of last box */}
        <div
          className="absolute top-0 w-0.5 h-5 bg-gray-400"
          style={{ left: `${dropLineX}px` }}
        ></div>
        {/* Horizontal line across to left side */}
        <div
          className="absolute top-5 h-0.5 bg-gray-400"
          style={{ left: `${leftSideX}px`, width: `${dropLineX - leftSideX}px` }}
        ></div>
        {/* Vertical line down to next row on left side */}
        <div
          className="absolute top-5 w-0.5 h-7 bg-gray-400"
          style={{ left: `${leftSideX}px` }}
        ></div>
        {/* Arrow pointing down */}
        <div
          className="absolute bottom-0"
          style={{
            left: `${leftSideX - 3}px`,
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '8px solid #9ca3af',
          }}
        ></div>
      </div>
    )
  }

  // START label with connector - fixed width for alignment
  const StartLabel = () => (
    <div className="flex items-center shrink-0 mr-1" style={{ width: `${startLabelWidth - 4}px` }}>
      <div className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
        START
      </div>
      <div className="flex-1 h-0.5 bg-gray-400 ml-1"></div>
      <div
        className="w-0 h-0"
        style={{
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderLeft: '8px solid #9ca3af',
        }}
      ></div>
    </div>
  )

  // END label with connector
  const EndLabel = () => (
    <div className="flex items-center shrink-0 ml-1">
      <div className="w-4 h-0.5 bg-gray-400 mr-1"></div>
      <div
        className="w-0 h-0 mr-1"
        style={{
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderLeft: '8px solid #9ca3af',
        }}
      ></div>
      <div className="px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold">
        END
      </div>
    </div>
  )

  const renderStep = (step) => (
    <div
      className="workflow-step-box relative rounded-lg border-2 flex items-center"
      style={{
        width: `${stepBoxWidth}px`,
        height: `${stepBoxHeight}px`,
        borderColor: step.valueClass ? VALUE_COLORS[step.valueClass].border : '#e5e7eb',
        backgroundColor: step.valueClass ? VALUE_COLORS[step.valueClass].bg : 'white',
      }}
    >
      {step.aiOpportunity && (
        <div
          className="workflow-ai-badge absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: AI_COLORS[step.aiOpportunity].border }}
          title={`AI: ${step.aiOpportunity}`}
        >
          {step.aiOpportunity[0].toUpperCase()}
        </div>
      )}
      <div className="workflow-step-content px-3 py-2 w-full">
        <div className="text-xs text-gray-500 leading-tight">Step {step.order}</div>
        <div className="text-sm font-medium text-gray-900 leading-tight break-words">{step.name}</div>
        <div className="text-xs text-gray-500 leading-tight">
          <span className="font-medium">Actor:</span> {step.actor || 'None'}
        </div>
        {step.isGovernanceGate && (
          <div className="text-xs text-amber-600 font-medium leading-tight">Gate</div>
        )}
      </div>
    </div>
  )

  // Check if this is the last step overall
  const isLastStepOverall = (rowIndex, stepIndex, rowSteps) => {
    return rowIndex === rows.length - 1 && stepIndex === rowSteps.length - 1
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-visible">
      <div className="space-y-0">
        {rows.map((rowSteps, rowIndex) => (
          <div key={rowIndex}>
            {/* Row of steps - all rows flow left to right */}
            <div className="flex items-center">
              {/* START label only before first step of first row */}
              {rowIndex === 0 && <StartLabel />}
              {/* Spacer for rows after first to align with Step 1 (not START label) */}
              {rowIndex > 0 && <div style={{ width: `${startLabelWidth}px` }} className="shrink-0"></div>}
              {rowSteps.map((step, stepIndex) => (
                <div key={step.id} className="flex items-center">
                  {renderStep(step)}
                  {/* Horizontal connector between steps in the same row */}
                  {stepIndex < rowSteps.length - 1 && <HorizontalConnector />}
                  {/* END label after the very last step */}
                  {isLastStepOverall(rowIndex, stepIndex, rowSteps) && <EndLabel />}
                </div>
              ))}
            </div>
            {/* Wrap connector to next row - connects end of this row to start of next row */}
            {rowIndex < rows.length - 1 && <WrapConnector previousRowSteps={rowSteps.length} />}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReviewScreen() {
  const { currentWorkflow, goBack, persistWorkflow } = useWorkflow()
  const exportRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)

  if (!currentWorkflow) return null

  const steps = currentWorkflow.steps

  // Calculate metrics
  const totalCycleTime = steps.reduce((sum, s) => sum + (s.cycleTime || 0), 0)
  const totalWaitTime = steps.reduce((sum, s) => sum + (s.waitTime || 0), 0)

  const vaSteps = steps.filter((s) => s.valueClass === 'VA')
  const bvaSteps = steps.filter((s) => s.valueClass === 'BVA')
  const nvaSteps = steps.filter((s) => s.valueClass === 'NVA')

  const vaRatio = steps.length > 0 ? Math.round((vaSteps.length / steps.length) * 100) : 0
  const vaCycleTime = vaSteps.reduce((sum, s) => sum + (s.cycleTime || 0), 0)
  const processEfficiency = totalCycleTime > 0 ? Math.round((vaCycleTime / totalCycleTime) * 100) : 0

  const highAI = steps.filter((s) => s.aiOpportunity === 'high')

  const allTools = [...new Set(steps.flatMap((s) => s.tools))]
  const gates = steps.filter((s) => s.isGovernanceGate)

  // Helper function to create simplified workflow map HTML for PDF export
  const createPdfWorkflowMap = () => {
    const stepsPerRow = 4
    const rows = []
    for (let i = 0; i < steps.length; i += stepsPerRow) {
      rows.push(steps.slice(i, i + stepsPerRow))
    }

    // Build simplified HTML with only inline styles
    let html = '<div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">'

    rows.forEach((rowSteps, rowIndex) => {
      // Row container
      html += '<div style="display: flex; align-items: center; margin-bottom: 8px;">'

      // START label for first row
      if (rowIndex === 0) {
        html += `
          <div style="display: flex; align-items: center; margin-right: 8px;">
            <div style="background: #059669; color: white; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold;">START</div>
            <div style="width: 16px; height: 2px; background: #9ca3af; margin-left: 4px;"></div>
            <div style="width: 0; height: 0; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 8px solid #9ca3af;"></div>
          </div>
        `
      } else {
        // Spacer for alignment on subsequent rows
        html += '<div style="width: 85px;"></div>'
      }

      // Steps in this row
      rowSteps.forEach((step, stepIndex) => {
        const borderColor = step.valueClass ? VALUE_COLORS[step.valueClass].border : '#e5e7eb'
        const bgColor = step.valueClass ? VALUE_COLORS[step.valueClass].bg : 'white'
        const isLastStep = rowIndex === rows.length - 1 && stepIndex === rowSteps.length - 1

        // Step box with centered content using table-cell
        html += `
          <div style="position: relative; width: 150px; min-height: 80px; border: 2px solid ${borderColor}; background: ${bgColor}; border-radius: 8px; display: table;">
            ${step.aiOpportunity ? `
              <div style="position: absolute; top: -10px; right: -10px; width: 24px; height: 24px; background: ${AI_COLORS[step.aiOpportunity].border}; border-radius: 50%; color: white; font-size: 12px; font-weight: bold; display: table-cell; text-align: center; vertical-align: middle; line-height: 24px;">
                ${step.aiOpportunity[0].toUpperCase()}
              </div>
            ` : ''}
            <div style="display: table-cell; vertical-align: middle; padding: 12px; text-align: left;">
              <div style="font-size: 12px; color: #6b7280; line-height: 1.3;">Step ${step.order}</div>
              <div style="font-size: 14px; font-weight: 500; color: #111827; line-height: 1.3;">${step.name}</div>
              <div style="font-size: 12px; color: #6b7280; line-height: 1.3;"><span style="font-weight: 500;">Actor:</span> ${step.actor || 'None'}</div>
              ${step.isGovernanceGate ? '<div style="font-size: 12px; color: #d97706; font-weight: 500; line-height: 1.3;">Gate</div>' : ''}
            </div>
          </div>
        `

        // Connector between steps (not after last in row)
        if (stepIndex < rowSteps.length - 1) {
          html += `
            <div style="display: flex; align-items: center; margin: 0 4px;">
              <div style="width: 24px; height: 2px; background: #9ca3af;"></div>
              <div style="width: 0; height: 0; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 8px solid #9ca3af;"></div>
            </div>
          `
        }

        // END label after last step
        if (isLastStep) {
          html += `
            <div style="display: flex; align-items: center; margin-left: 8px;">
              <div style="width: 16px; height: 2px; background: #9ca3af; margin-right: 4px;"></div>
              <div style="width: 0; height: 0; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 8px solid #9ca3af; margin-right: 4px;"></div>
              <div style="background: #dc2626; color: white; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold;">END</div>
            </div>
          `
        }
      })

      html += '</div>' // End row

      // Wrap connector between rows
      if (rowIndex < rows.length - 1) {
        html += `
          <div style="position: relative; height: 40px; margin: 8px 0;">
            <div style="position: absolute; left: 160px; top: 0; width: 2px; height: 20px; background: #9ca3af;"></div>
            <div style="position: absolute; left: 160px; top: 20px; width: 2px; height: 20px; background: #9ca3af;"></div>
          </div>
        `
      }
    })

    html += '</div>'
    return html
  }

  const handleExport = async () => {
    if (!exportRef.current || isExporting) return

    setIsExporting(true)

    // Save workflow first (non-blocking for export)
    try {
      persistWorkflow()
    } catch (saveError) {
      console.warn('Failed to persist workflow before export:', saveError)
    }

    try {
      // Dynamic imports with explicit error handling
      let domtoimage, jsPDF

      try {
        const domtoimageModule = await import('dom-to-image')
        domtoimage = domtoimageModule.default || domtoimageModule
        if (!domtoimage || typeof domtoimage.toPng !== 'function') {
          throw new Error('dom-to-image module did not load correctly')
        }
      } catch (importError) {
        throw new Error(`Failed to load dom-to-image: ${importError.message}`)
      }

      try {
        const jsPDFModule = await import('jspdf')
        // Handle both named export and default export patterns
        jsPDF = jsPDFModule.jsPDF || jsPDFModule.default
        if (typeof jsPDF !== 'function') {
          throw new Error('jsPDF module did not load correctly')
        }
      } catch (importError) {
        throw new Error(`Failed to load jsPDF: ${importError.message}`)
      }

      const element = exportRef.current
      if (!element) {
        throw new Error('Export element not found')
      }

      // APPROACH: Replace workflow map section with simplified inline-styled version for PDF
      const workflowMapSection = element.querySelector('section')
      const originalWorkflowMapHTML = workflowMapSection ? workflowMapSection.innerHTML : null

      if (workflowMapSection) {
        // Replace the workflow map with simplified PDF version
        workflowMapSection.innerHTML = `
          <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 12px;">Workflow Map</h2>
          ${createPdfWorkflowMap()}
        `
      }

      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 100))

      // Capture the content as PNG using dom-to-image (better CSS support than html2canvas)
      let imgData
      try {
        imgData = await domtoimage.toPng(element, {
          quality: 1,
          bgcolor: '#ffffff',
          style: {
            transform: 'scale(2)',
            transformOrigin: 'top left',
          },
          width: element.offsetWidth * 2,
          height: element.offsetHeight * 2,
        })
      } catch (captureError) {
        // Restore original workflow map HTML before throwing
        if (workflowMapSection && originalWorkflowMapHTML) {
          workflowMapSection.innerHTML = originalWorkflowMapHTML
        }
        throw new Error(`Failed to capture content: ${captureError.message}`)
      }

      // Get element dimensions before restoring (for PDF sizing)
      const elementWidth = element.offsetWidth
      const elementHeight = element.offsetHeight

      // Restore original workflow map HTML after capture
      if (workflowMapSection && originalWorkflowMapHTML) {
        workflowMapSection.innerHTML = originalWorkflowMapHTML
      }

      if (!imgData || imgData === 'data:,') {
        throw new Error('Failed to capture content as image')
      }

      // Create PDF in portrait orientation
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10

      // Calculate dimensions to fit content width (using 2x scale from capture)
      const imgWidthPx = elementWidth * 2
      const imgHeightPx = elementHeight * 2
      const pdfImgWidth = pageWidth - (margin * 2)
      const pdfImgHeight = (imgHeightPx * pdfImgWidth) / imgWidthPx
      const usablePageHeight = pageHeight - (margin * 2)

      // Add the image with multi-page support
      try {
        if (pdfImgHeight <= usablePageHeight) {
          // Content fits on one page
          pdf.addImage(imgData, 'PNG', margin, margin, pdfImgWidth, pdfImgHeight)
        } else {
          // Content spans multiple pages - need to load image to canvas for slicing
          const img = new Image()
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = imgData
          })

          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)

          let remainingHeight = pdfImgHeight
          let sourceY = 0
          let pageNum = 0

          while (remainingHeight > 0) {
            if (pageNum > 0) {
              pdf.addPage()
            }

            const sliceHeight = Math.min(usablePageHeight, remainingHeight)
            const sourceSliceHeight = (sliceHeight / pdfImgHeight) * canvas.height

            // Create a temporary canvas for this page slice
            const tempCanvas = document.createElement('canvas')
            tempCanvas.width = canvas.width
            tempCanvas.height = sourceSliceHeight
            const tempCtx = tempCanvas.getContext('2d')
            tempCtx.drawImage(
              canvas,
              0, sourceY, canvas.width, sourceSliceHeight,
              0, 0, canvas.width, sourceSliceHeight
            )

            const sliceImgData = tempCanvas.toDataURL('image/png')
            pdf.addImage(sliceImgData, 'PNG', margin, margin, pdfImgWidth, sliceHeight)

            sourceY += sourceSliceHeight
            remainingHeight -= sliceHeight
            pageNum++
          }
        }
      } catch (imageError) {
        throw new Error(`Failed to add image to PDF: ${imageError.message}`)
      }

      // Generate filename: WIM-WorkflowName-Date.pdf
      const sanitizedName = (currentWorkflow.name || 'Untitled')
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)
      const date = new Date().toISOString().split('T')[0]
      const filename = `WIM-${sanitizedName}-${date}.pdf`

      // Trigger download
      pdf.save(filename)
    } catch (error) {
      console.error('PDF export failed:', error)
      alert(`Failed to export PDF: ${error.message || 'Unknown error occurred'}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleFinish = () => {
    persistWorkflow()
    goBack()
  }

  return (
    <ScreenLayout
      title="Review & Export"
      subtitle="Review your workflow analysis and export the results."
      showNext={false}
    >
      <div className="space-y-8">
        {/* Exportable content container */}
        <div ref={exportRef} className="space-y-8 bg-white p-6 -m-6 mb-0">
          {/* Header for PDF */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Workflow Intelligence Map</h1>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-semibold">Workflow:</span> {currentWorkflow.name || 'Untitled Workflow'}
                </p>
                {currentWorkflow.customerValueStatement && (
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">Value Statement:</span> {currentWorkflow.customerValueStatement}
                  </p>
                )}
              </div>
              <img
                src="/logo.png"
                alt="AIPM Logo"
                className="w-16 h-16 object-contain ml-4"
              />
            </div>
          </div>

          {/* Workflow Map */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Workflow Map</h2>
          <WorkflowMap steps={steps} />
        </section>

        {/* Key Metrics */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Steps"
              value={steps.length}
              color="sky"
            />
            <MetricCard
              label="Value-Add Ratio"
              value={`${vaRatio}%`}
              subtext={`${vaSteps.length} of ${steps.length} steps`}
              color="emerald"
            />
            <MetricCard
              label="Total Cycle Time"
              value={`${totalCycleTime}m`}
              subtext={`+ ${totalWaitTime}h wait`}
              color="sky"
            />
            <MetricCard
              label="Process Efficiency"
              value={`${processEfficiency}%`}
              subtext="VA cycle time / total"
              color="emerald"
            />
          </div>
        </section>

        {/* Value Breakdown */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Value Classification</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: VALUE_COLORS.VA.bg }}>
              <div className="text-2xl font-bold" style={{ color: VALUE_COLORS.VA.text }}>
                {vaSteps.length}
              </div>
              <div className="text-sm" style={{ color: VALUE_COLORS.VA.text }}>Value-Add</div>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: VALUE_COLORS.BVA.bg }}>
              <div className="text-2xl font-bold" style={{ color: VALUE_COLORS.BVA.text }}>
                {bvaSteps.length}
              </div>
              <div className="text-sm" style={{ color: VALUE_COLORS.BVA.text }}>Business Value-Add</div>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: VALUE_COLORS.NVA.bg }}>
              <div className="text-2xl font-bold" style={{ color: VALUE_COLORS.NVA.text }}>
                {nvaSteps.length}
              </div>
              <div className="text-sm" style={{ color: VALUE_COLORS.NVA.text }}>Non Value-Add (Waste)</div>
            </div>
          </div>
        </section>

        {/* Insights */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Waste */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-800 mb-2">Waste to Eliminate</h3>
              {nvaSteps.length > 0 ? (
                <ul className="text-sm text-red-700 space-y-1">
                  {nvaSteps.map((s) => (
                    <li key={s.id}>• {s.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-red-600">No NVA steps identified</p>
              )}
            </div>

            {/* AI Opportunities */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-800 mb-2">AI Opportunities</h3>
              {highAI.length > 0 ? (
                <ul className="text-sm text-purple-700 space-y-1">
                  {highAI.map((s) => (
                    <li key={s.id}>• {s.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-purple-600">No high-opportunity steps</p>
              )}
            </div>

            {/* Protect */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="font-medium text-emerald-800 mb-2">Protect (VA + Low AI)</h3>
              {vaSteps.filter((s) => s.aiOpportunity === 'low').length > 0 ? (
                <ul className="text-sm text-emerald-700 space-y-1">
                  {vaSteps
                    .filter((s) => s.aiOpportunity === 'low')
                    .map((s) => (
                      <li key={s.id}>• {s.name}</li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-emerald-600">No steps to protect</p>
              )}
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Tools Used ({allTools.length})</h3>
            {allTools.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allTools.map((tool) => (
                  <span key={tool} className="px-2 py-1 bg-white border rounded text-sm">
                    {tool}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No tools specified</p>
            )}
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Governance Gates ({gates.length})</h3>
            {gates.length > 0 ? (
              <ul className="text-sm text-gray-700 space-y-1">
                {gates.map((s) => (
                  <li key={s.id}>• Step {s.order}: {s.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No governance gates defined</p>
            )}
          </div>
        </section>

        </div>
        {/* End exportable content */}

        {/* Actions - outside export area */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="secondary" onClick={handleFinish}>
            Save & Exit
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}
