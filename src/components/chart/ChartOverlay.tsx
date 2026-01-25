/**
 * Chart Overlay Components
 * 
 * Extracted overlay UI for chart conditions following SoC principle.
 * Previously inline in VolumeInTimeChart.tsx
 */

import React from 'react';

interface OverlayProps {
  children: React.ReactNode;
}

/**
 * Base overlay wrapper with blur background
 */
const ChartOverlayBase: React.FC<OverlayProps> = ({ children }) => (
  <div
    className="absolute inset-0 rounded-lg z-10 flex items-center justify-center"
    style={{
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(2px)'
    }}
  >
    <div className="bg-white p-6 rounded-lg shadow-xl text-center">
      {children}
    </div>
  </div>
);

interface NoMatchOverlayProps {
  message?: string;
}

/**
 * Overlay shown when no slots match active filters
 */
export const NoMatchOverlay: React.FC<NoMatchOverlayProps> = ({
  message = 'Pro zobrazení dat zvolte jinou kombinaci filtrů'
}) => (
  <ChartOverlayBase>
    <p className="text-gray-700 text-lg">{message}</p>
  </ChartOverlayBase>
);

interface ManualLoadOverlayProps {
  itemCount: number;
  onLoad: () => void;
  loadingLabel?: string;
  buttonLabel?: string;
}

/**
 * Overlay prompting user to manually load data for large datasets
 */
export const ManualLoadOverlay: React.FC<ManualLoadOverlayProps> = ({
  itemCount,
  onLoad,
  loadingLabel = 'položek',
  buttonLabel = 'Načíst data pro vyfiltrované položky'
}) => (
  <ChartOverlayBase>
    <p className="text-gray-700 mb-4">
      Zobrazeno {itemCount} {loadingLabel}
    </p>
    <button
      onClick={onLoad}
      className="px-4 py-2 bg-[var(--color-primary)] text-black rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-semibold"
    >
      {buttonLabel}
    </button>
  </ChartOverlayBase>
);

export default { NoMatchOverlay, ManualLoadOverlay };
