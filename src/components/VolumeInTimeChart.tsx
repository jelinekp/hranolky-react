import React, {useMemo, useState, useEffect} from "react";
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine} from 'recharts';
import {useFetchFilteredVolumeHistory} from "../hooks/useFetchFilteredVolumeHistory.ts";
import {SlotType, WarehouseSlotClass} from "hranolky-firestore-common";

export interface VolumeInTimeChartProps {
  currentVolume: number;
  slotType?: SlotType;
  filteredSlots: WarehouseSlotClass[];
  hasActiveFilters: boolean;
}

interface VolumeDataPoint {
  week: string;
  volume: number;
}

// Mock data generator for initial loading animation
const generateMockVolumeData = (): VolumeDataPoint[] => {
  const data: VolumeDataPoint[] = [];
  const today = new Date();
  const weeksToShow = 30; // Show last 30 weeks

  for (let i = weeksToShow - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - (i * 7));

    // Find the most recent Sunday
    const dayOfWeek = date.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
    date.setDate(date.getDate() - daysToSubtract);

    const weekLabel = `${date.getDate()}.${date.getMonth() + 1}.`;

    // Generate mock volume data with some variation (fixed seed for consistency)
    const baseVolume = 45;
    const seasonalVariation = Math.sin((i / weeksToShow) * Math.PI * 2) * 5;
    const trend = (weeksToShow - i) * 0.5; // Slight upward trend
    const randomNoise = (Math.sin(i * 123.456) + 1) * 2.5; // Deterministic "random"
    const volume = parseFloat((baseVolume + seasonalVariation + trend + randomNoise).toFixed(2));

    data.push({ week: weekLabel, volume });
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

  // Extract slot IDs from filtered slots
  const filteredSlotIds = useMemo(() =>
    filteredSlots.map(slot => slot.productId),
    [filteredSlots]
  );

  const { volumeData, loading } = useFetchFilteredVolumeHistory(
    slotType,
    filteredSlotIds,
    hasActiveFilters,
    500
  );

  // Pulsing animation effect when loading
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setPulseOpacity(() => {
          // Goofy bouncy pulse between 0.3 and 1
          return 0.65 + Math.sin(Date.now() / 200) * 0.35;
        });
      }, 50); // Update every 50ms for smooth animation

      return () => clearInterval(interval);
    } else {
      setPulseOpacity(1);
    }
  }, [loading]);

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

  // Calculate Y-axis domain and ticks
  const { yDomain, yTicks } = useMemo(() => {
    if (displayData.length === 0) {
      return {
        yDomain: [0, 100],
        yTicks: [0, 25, 50, 75, 100]
      };
    }

    const maxValue = Math.max(...displayData.map(d => d.volume));
    const roundedMax = Math.ceil(maxValue / 5) * 5; // Round up to nearest multiple of 5
    const step = roundedMax / 4; // Divide into 4 intervals (5 labels: 0, 1, 2, 3, 4)
    const roundedStep = Math.ceil(step / 5) * 5; // Round step to multiple of 5
    const actualMax = roundedStep * 4; // Recalculate max based on rounded step

    const ticks = [0, roundedStep, roundedStep * 2, roundedStep * 3, actualMax];

    return {
      yDomain: [0, actualMax],
      yTicks: ticks
    };
  }, [displayData]);

  // Calculate inventory check weeks (weeks 1, 14, 27, 40)
  const inventoryCheckWeeks = useMemo(() => {
    const checkWeeks = [1, 14, 27, 40];
    // Filter to only include weeks that are present in the data
    return displayData
      .filter(d => checkWeeks.includes(parseInt(d.week)))
      .map(d => d.week);
  }, [displayData]);

  // Custom tooltip component
  // ...existing code...
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: VolumeDataPoint; value: number }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-lg">
          <p className="font-semibold">{payload[0].payload.week}</p>
          <p className="text-[var(--color-primary-light)]">{payload[0].value.toFixed(2)} m³</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Objem v čase po týdnech (m³)</h3>
        {loading && (
          <span className="text-sm text-gray-500 italic animate-pulse">
            Aktualizuji data...
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={displayData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text-03)" opacity={0.3} />
          <XAxis
            dataKey="week"
            style={{ fontSize: '12px' }}
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
            type="monotone"
            dataKey="volume"
            stroke="var(--color-primary)"
            strokeWidth={3}
            strokeOpacity={pulseOpacity}
            dot={{ fill: 'var(--color-primary)', r: 4, opacity: pulseOpacity }}
            activeDot={{ r: 6, fill: 'var(--color-primary-dark)' }}
          />
        </LineChart>
      </ResponsiveContainer>

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
  );
};

export default VolumeInTimeChart;

