import React, {useMemo} from "react";
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine} from 'recharts';
import {useFetchVolumeHistory} from "../hooks/useFetchVolumeHistory.ts";
import {SlotType} from "../../common/SlotType.ts";

export interface VolumeInTimeChartProps {
  currentVolume: number;
  slotType?: SlotType;
}

interface VolumeDataPoint {
  week: string;
  volume: number;
}

const VolumeInTimeChart: React.FC<VolumeInTimeChartProps> = ({ currentVolume, slotType = SlotType.Beam }) => {

  const { volumeData, loading } = useFetchVolumeHistory(slotType, 500);

  // Calculate Y-axis domain and ticks
  const { yDomain, yTicks } = useMemo(() => {
    if (volumeData.length === 0) {
      return {
        yDomain: [0, 100],
        yTicks: [0, 25, 50, 75, 100]
      };
    }

    const maxValue = Math.max(...volumeData.map(d => d.volume));
    const roundedMax = Math.ceil(maxValue / 5) * 5; // Round up to nearest multiple of 5
    const step = roundedMax / 4; // Divide into 4 intervals (5 labels: 0, 1, 2, 3, 4)
    const roundedStep = Math.ceil(step / 5) * 5; // Round step to multiple of 5
    const actualMax = roundedStep * 4; // Recalculate max based on rounded step

    const ticks = [0, roundedStep, roundedStep * 2, roundedStep * 3, actualMax];

    return {
      yDomain: [0, actualMax],
      yTicks: ticks
    };
  }, [volumeData]);

  // Calculate inventory check weeks (weeks 1, 14, 27, 40)
  const inventoryCheckWeeks = useMemo(() => {
    const checkWeeks = [1, 14, 27, 40];
    // Filter to only include weeks that are present in the data
    return volumeData
      .filter(d => checkWeeks.includes(parseInt(d.week)))
      .map(d => d.week);
  }, [volumeData]);

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
      <h3 className="text-lg font-bold mb-4">Objem v čase po týdnech (m³)</h3>

      {loading ? (
        <div className="flex items-center justify-center h-[250px]">
          <p className="text-gray-500">Načítání dat...</p>
        </div>
      ) : volumeData.length === 0 ? (
        <div className="flex items-center justify-center h-[250px]">
          <p className="text-gray-500">Žádná data k zobrazení</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={volumeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
              dot={{ fill: 'var(--color-primary)', r: 4 }}
              activeDot={{ r: 6, fill: 'var(--color-primary-dark)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

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

