import React, { useEffect, useMemo, useState, useCallback } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFetchFilteredVolumeHistory } from "../hooks/data/useFetchFilteredVolumeHistory.ts";
import { SlotType, WarehouseSlotClass, VolumeDataPoint, getCurrentWeekLabel } from "hranolky-firestore-common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faCompress } from "@fortawesome/free-solid-svg-icons";

export interface VolumeInTimeChartProps {
  currentVolume: number;
  slotType?: SlotType;
  filteredSlots: WarehouseSlotClass[];
  hasActiveFilters: boolean;
}

// VolumeDataPoint type now imported from hranolky-firestore-common
// getCurrentWeekLabel now imported from hranolky-firestore-common

// Mock data generator for initial loading animation
const generateMockVolumeData = (): VolumeDataPoint[] => {
  const data: VolumeDataPoint[] = [];

  // Generate some simple mock data with current week format
  // This is just placeholder for loading animation
  for (let i = 0; i < 20; i++) {
    const baseVolume = 45;
    const randomVariation = Math.sin(i * 0.5) * 10;
    const volume = parseFloat((baseVolume + randomVariation).toFixed(2));

    data.push({ week: `mock_${i}`, volume });
  }

  return data;
};

const VolumeInTimeChart: React.FC<VolumeInTimeChartProps> = ({
  currentVolume,
  slotType = SlotType.Beam,
  filteredSlots,
  hasActiveFilters
}) => {

  // State for pulsing animation
  const [pulseOpacity, setPulseOpacity] = useState(1);
  const [displayData, setDisplayData] = useState<VolumeDataPoint[]>(() => generateMockVolumeData());
  const [goofyOffsets, setGoofyOffsets] = useState<number[]>([]);
  const [manualLoadRequested, setManualLoadRequested] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // ESC key handler to close expanded view
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isExpanded) {
      setIsExpanded(false);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isExpanded, handleKeyDown]);

  // Extract slot IDs from filtered slots
  const filteredSlotIds = useMemo(() =>
    filteredSlots.map(slot => slot.productId),
    [filteredSlots]
  );

  // Determine if we should wait for manual load
  const shouldWaitForManualLoad = hasActiveFilters && filteredSlots.length > 10;
  const shouldFetchData = !shouldWaitForManualLoad || manualLoadRequested;

  // Debug: trace inputs to the hook
  /*
  console.log('[VolumeInTimeChart] hasActiveFilters:', hasActiveFilters,
    '| filteredSlots:', filteredSlots.length,
    '| shouldWaitForManualLoad:', shouldWaitForManualLoad,
    '| manualLoadRequested:', manualLoadRequested,
    '| shouldFetchData:', shouldFetchData);
  */

  const { volumeData, loading } = useFetchFilteredVolumeHistory(
    slotType,
    shouldFetchData ? filteredSlotIds : [], // Pass empty array to prevent fetch
    shouldFetchData && hasActiveFilters,
    500
  );

  // Reset manual load request when filters change
  useEffect(() => {
    if (hasActiveFilters && filteredSlots.length > 10) {
      setManualLoadRequested(false);
    } else {
      setManualLoadRequested(true); // Auto-load when conditions don't require manual load
    }
  }, [hasActiveFilters, filteredSlots.length]);

  // Goofy pulsing animation effect when loading - each point bounces differently!
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setPulseOpacity(() => {
          // Overall opacity pulse between 0.3 and 1
          return 0.65 + Math.sin(Date.now() / 200) * 0.35;
        });

        // Each data point gets a random-ish offset for goofy up/down bouncing
        setGoofyOffsets(displayData.map((_, index) => {
          // Different frequency for each point based on index
          const time = Date.now() / 300;
          const offset = Math.sin(time + index * 0.5) * Math.cos(time * 0.7 + index * 0.3);
          // Scale to make a subtle wavy effect (max 15% variation)
          const baseValue = displayData[index]?.volume || 50;
          return offset * baseValue * 0.15; // Max 15% up or down
        }));
      }, 50); // Update every 50ms for smooth goofy animation

      return () => clearInterval(interval);
    } else {
      setPulseOpacity(1);
      setGoofyOffsets([]);
    }
  }, [loading, displayData]);

  // Update display data when real data loads
  useEffect(() => {
    if (!loading && volumeData.length > 0) {
      // Use real data
      setDisplayData(volumeData);
    } else if (loading && displayData.length > 0 && volumeData.length === 0) {
      // Keep showing last data while loading new data
      // displayData stays as is
    } else if (loading && volumeData.length > 0) {
      // If we have previous real data, use that for the pulse animation
      setDisplayData(volumeData);
    }
  }, [loading, volumeData]);

  // Apply goofy bouncing offsets to data during loading
  // Don't memoize this - we want it to recalculate every render during animation!
  // Force a completely new array reference to trigger Recharts re-render
  const animatedData = (() => {
    let baseData = displayData;

    if (loading && goofyOffsets.length > 0) {
      // Make each point bounce up and down by different amounts!
      // Create a COMPLETELY NEW array with new object references to force Recharts update
      baseData = displayData.map((point, index) => {
        const offset = goofyOffsets[index] || 0;
        return {
          week: point.week,
          volume: Math.max(0, point.volume + offset),
          // Add a random key to force object difference detection
          _animKey: Math.random()
        };
      });
    }

    // Always add or update current volume as the last point
    const currentWeekLabel = getCurrentWeekLabel();

    // Filter out any existing data for the current week to avoid duplicates 
    // and ensure the live 'currentVolume' value takes precedence
    const filteredBaseData = baseData.filter(d => d.week !== currentWeekLabel);

    // Append the live current volume
    return [...filteredBaseData, { week: currentWeekLabel, volume: currentVolume }];
  })();

  // Calculate Y-axis domain and ticks
  // Keep axis FIXED during loading so wave is visible!
  const { yDomain, yTicks } = (() => {
    // Always use base displayData for Y-axis calculation (not animated data)
    const dataToUse = displayData;

    if (dataToUse.length === 0) {
      return {
        yDomain: [0, 100] as [number, number],
        yTicks: [0, 25, 50, 75, 100]
      };
    }

    const maxValue = Math.max(...dataToUse.map(d => d.volume));

    // Adaptive step calculation based on the max value
    const paddedMax = maxValue * 1.02; // 2% padding
    let step = 1;

    if (paddedMax <= 10) step = 1;
    else if (paddedMax <= 40) step = 5;
    else if (paddedMax <= 100) step = 10;
    else step = 25;

    // Calculate actual max and generate ticks based on the chosen step
    const numSteps = Math.ceil(paddedMax / step);
    const actualMax = numSteps * step;
    const ticks = Array.from({ length: numSteps + 1 }, (_, i) => i * step);

    return {
      yDomain: [0, actualMax] as [number, number],
      yTicks: ticks
    };
  })();

  // Calculate inventory check weeks (weeks 14, 27, 40, 51)
  const inventoryCheckWeeks = useMemo(() => {
    const checkWeeks = [14, 27, 40, 51];
    // Filter to only include weeks that are present in the data
    return displayData
      .filter(d => {
        // Extract week number from YYYY_WW format
        const weekNum = parseInt(d.week.split('_')[1] || d.week);
        return checkWeeks.includes(weekNum);
      })
      .map(d => d.week);
  }, [displayData]);

  // Custom X-axis tick component with two rows (week number + year grouping)
  const CustomXAxisTick = ({ x, y, payload, index }: { x?: number; y?: number; payload?: { value: string }; index?: number }) => {
    if (!payload || x === undefined || y === undefined || index === undefined) return null;

    const weekStr = payload.value;
    const parts = weekStr.split('_');
    const year = parts[0] || '';
    const weekNum = parts[1] || weekStr;

    // Check if this is the first tick of a new year or the first tick overall
    const prevWeek = index > 0 ? animatedData[index - 1]?.week : null;
    const prevYear = prevWeek ? prevWeek.split('_')[0] : null;
    const isFirstOfYear = index === 0 || year !== prevYear;

    // Check if next tick is a different year (to know where year group ends)
    const nextWeek = index < animatedData.length - 1 ? animatedData[index + 1]?.week : null;
    const nextYear = nextWeek ? nextWeek.split('_')[0] : null;
    const isLastOfYear = index === animatedData.length - 1 || year !== nextYear;
    // Show week label every 2 weeks, at year boundaries, or at last item
    const showWeekLabel = isFirstOfYear || isLastOfYear || (index % 2 === 0);

    return (
      <g transform={`translate(${x},${y})`}>
        {/* Week number on top - black for visibility */}
        {showWeekLabel && (
          <text
            x={0}
            y={0}
            dy={12}
            textAnchor="middle"
            fill="#333333"
            fontSize={10}
            fontWeight="500"
          >
            {weekNum}
          </text>
        )}

        {/* Year label - only show at the start of each year group */}
        {isFirstOfYear && (
          <text
            x={2}
            y={0}
            dy={32}
            textAnchor="start"
            fill="var(--color-text-03)"
            fontSize={10}
            fontWeight="bold"
          >
            {year.length === 2 ? `20${year}` : year}
          </text>
        )}

        {/* Year grouping line - solid by increasing overlap */}
        <line
          x1={isFirstOfYear ? 0 : -50}
          y1={20}
          x2={isLastOfYear ? 0 : 50}
          y2={20}
          stroke="var(--color-text-03)"
          strokeWidth={1.5}
        />
      </g>
    );
  };

  // Custom tooltip component
  // ...existing code...
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: VolumeDataPoint; value: number }> }) => {
    if (active && payload && payload.length) {
      const weekStr = payload[0].payload.week;
      const parts = weekStr.split('_');
      const displayLabel = parts.length === 2 ? `Týden ${parts[1]}/${parts[0]}` : weekStr;

      return (
        <div className="bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-lg">
          <p className="font-semibold">{displayLabel}</p>
          <p className="text-[var(--color-primary-light)]">{payload[0].value.toFixed(2)} m³</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsExpanded(false)}
        />
      )}
      <div
        className={`bg-[var(--color-bg-01)] p-6 md:p-8 rounded-3xl shadow-lg transition-all duration-300 ${isExpanded ? 'fixed inset-6 md:inset-10 lg:inset-14 z-50 flex flex-col overflow-hidden' : ''
          }`}
      >
        <div className="flex justify-between items-center mb-4 flex-none">
          <h3 className="text-lg font-bold">Objem v čase po týdnech (m³)</h3>
          <div className="flex items-center gap-3">
            {loading && shouldFetchData && (
              <span className="text-sm text-gray-500 italic animate-pulse">
                Aktualizuji data...
              </span>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors border-0 outline-none bg-transparent cursor-pointer focus:outline-none active:outline-none"
              title={isExpanded ? 'Sbalit graf (Esc)' : 'Rozbalit graf'}
            >
              <FontAwesomeIcon
                icon={isExpanded ? faCompress : faExpand}
                className="text-gray-600"
              />
            </button>
          </div>
        </div>

        <div className={`relative ${isExpanded ? 'flex-1 min-h-0' : 'h-[400px]'}`}>
          {/* Overlay when no slots match filters */}
          {hasActiveFilters && filteredSlots.length === 0 && (
            <div
              className="absolute inset-0 rounded-lg z-10 flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(2px)'
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                <p className="text-gray-700 text-lg">
                  Pro zobrazení dat zvolte jinou kombinaci filtrů
                </p>
              </div>
            </div>
          )}

          {/* Overlay when manual load is required */}
          {shouldWaitForManualLoad && !manualLoadRequested && filteredSlots.length > 0 && (
            <div
              className="absolute inset-0 rounded-lg z-10 flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(2px)'
              }}
            >
              <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                <p className="text-gray-700 mb-4">
                  Zobrazeno {filteredSlots.length} položek
                </p>
                <button
                  onClick={() => setManualLoadRequested(true)}
                  className="bg-[var(--color-primary)] px-6 py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  Načíst graf
                </button>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={animatedData}
              margin={{ top: 5, right: 10, left: 0, bottom: 45 }}
              key={loading ? 'loading' : 'loaded'}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text-03)" opacity={0.3} />
              <XAxis
                dataKey="week"
                tick={<CustomXAxisTick />}
                tickLine={false}
                axisLine={{ stroke: 'var(--color-text-03)' }}
                height={55}
                interval={0}
              />
              <YAxis
                domain={yDomain}
                ticks={yTicks}
                style={{ fontSize: '12px' }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Inventory check reference lines */}
              {inventoryCheckWeeks.map(week => (
                <ReferenceLine
                  key={week}
                  x={week}
                  stroke="red"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{
                    value: 'Inventura',
                    position: 'top',
                    fill: 'red',
                    fontSize: 10
                  }}
                />
              ))}

              <Line
                type={loading ? "natural" : "monotone"}
                dataKey="volume"
                stroke="var(--color-primary)"
                strokeWidth={3}
                strokeOpacity={pulseOpacity}
                dot={{ fill: 'var(--color-primary)', r: 4, opacity: pulseOpacity }}
                activeDot={{ r: 6, fill: 'var(--color-primary-dark)' }}
                animationDuration={loading ? 0 : 300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-none mt-2">
          <span className="text-sm">Červené čáry značí provedené inventury</span>
          {/* Current volume indicator */}
          <div className="mt-4 pt-4 border-t border-[var(--color-text-03)]">
            <div className="flex justify-between items-center">
              <span className="text-sm">Aktuální objem na skladě:</span>
              <span className="text-lg font-bold text-[var(--color-primary)]">
                {currentVolume.toFixed(2)} m³
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VolumeInTimeChart;

