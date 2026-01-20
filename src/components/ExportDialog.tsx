/**
 * Export Dialog Component
 * 
 * Extracted from Filters.tsx following the Separation of Concerns (SoC) 
 * principle from Normalized Systems theory. This component handles the 
 * export options modal, while the parent component manages the export logic.
 */

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileExport, faCopy } from '@fortawesome/free-solid-svg-icons'

export interface ExportDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback to close the dialog */
  onClose: () => void
  /** Callback for CSV export action */
  onExportCsv: () => void
  /** Callback for clipboard copy action */
  onCopyToClipboard: () => void
  /** Whether an export operation is in progress */
  isExporting: boolean
  /** Whether a copy operation is in progress */
  isCopying: boolean
  /** Number of items that will be exported */
  itemCount: number
}

/**
 * Modal dialog for choosing export format (CSV download or clipboard copy)
 */
const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExportCsv,
  onCopyToClipboard,
  isExporting,
  isCopying,
  itemCount,
}) => {
  if (!isOpen) return null

  const isDisabled = isExporting || isCopying
  const buttonBaseClass = "w-full text-left p-4 rounded-lg border-2 flex items-center gap-3"
  const buttonEnabledClass = "hover:bg-grey hover:border-blue-500 cursor-pointer border-gray-300"
  const buttonDisabledClass = "opacity-50 cursor-not-allowed bg-gray-100"

  const handleExportCsv = () => {
    onClose()
    onExportCsv()
  }

  const handleCopyToClipboard = () => {
    onClose()
    onCopyToClipboard()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-bg-01)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4">Exportovat historii stavů</h3>

        {itemCount > 100 && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ Export může trvat déle při velkém množství položek (cca {Math.round(itemCount / 10)} sekund).
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleExportCsv}
            disabled={isDisabled}
            className={`${buttonBaseClass} ${isDisabled ? buttonDisabledClass : buttonEnabledClass}`}
          >
            <FontAwesomeIcon icon={faFileExport} className="text-xl" />
            <div>
              <div className="font-semibold">Stáhnout jako CSV</div>
              <div className="text-sm text-gray-600">Uložit data do CSV souboru</div>
            </div>
          </button>

          <button
            onClick={handleCopyToClipboard}
            disabled={isDisabled}
            className={`${buttonBaseClass} ${isDisabled ? buttonDisabledClass : buttonEnabledClass}`}
          >
            <FontAwesomeIcon icon={faCopy} className="text-xl" />
            <div>
              <div className="font-semibold">Kopírovat pro Excel</div>
              <div className="text-sm text-gray-600">Zkopírovat data do schránky</div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Zrušit
        </button>
      </div>
    </div>
  )
}

export default ExportDialog
