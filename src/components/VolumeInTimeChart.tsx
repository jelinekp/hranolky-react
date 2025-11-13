import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface VolumeInTimeChartProps {
  currentVolume: number;
}

interface VolumeDataPoint {
  week: string;
  volume: number;
}

// Mock data generator - replace this with actual VolumeHistory fetch later
const generateMockVolumeData = (): VolumeDataPoint[] => {
  const data: VolumeDataPoint[] = [];
  const today = new Date();
  const weeksToShow = 12; // Show last 12 weeks

  for (let i = weeksToShow - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - (i * 7));

    // Find the most recent Sunday
    const dayOfWeek = date.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
    date.setDate(date.getDate() - daysToSubtract);

    const weekLabel = `${date.getDate()}.${date.getMonth() + 1}.`;

    // Generate mock volume data with some variation (fixed seed for consistency)
    const baseVolume = 65;
    const seasonalVariation = Math.sin((i / weeksToShow) * Math.PI * 2) * 11;
    const trend = (weeksToShow - i) * 2; // Slight upward trend
    const randomNoise = (Math.sin(i * 123.456) + 1) * 3; // Deterministic "random"
    const volume = parseFloat((baseVolume + seasonalVariation + trend + randomNoise).toFixed(2));

    data.push({ week: weekLabel, volume });
  }

  console.log(data);

  return data;
};

const VolumeInTimeChart: React.FC<VolumeInTimeChartProps> = ({ currentVolume }) => {
  // TODO: Replace mock data with actual VolumeHistory fetch
  // const { volumeHistory, loading } = useFetchVolumeHistory("VolumeHistory");

  const volumeData = useMemo(() => generateMockVolumeData(), []);


  // Calculate Y-axis domain and ticks
  const { yDomain, yTicks } = useMemo(() => {
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

  // Custom tooltip component
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
      <h3 className="text-lg font-bold mb-4">Objem v čase (m³)</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={volumeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text-03)" opacity={0.3} />
          <XAxis
            dataKey="week"
            style={{ fontSize: '12px' }}
            tick={{ }}
          />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            style={{ fontSize: '12px' }}
            tick={{ }}
          />
          <Tooltip content={<CustomTooltip />} />
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

      {/* Current volume indicator */}
      <div className="mt-4 pt-4 border-t border-[var(--color-text-03)]">
        <div className="flex justify-between items-center">
          <span className="text-sm">Aktuální objem:</span>
          <span className="text-lg font-bold text-[var(--color-primary)]">
            {currentVolume.toFixed(2)} m³
          </span>
        </div>
      </div>

      {/* Info note about mock data */}
      <div className="mt-2 text-xs text-[var(--color-text-03)] italic">
        * Graf zobrazuje mockovaná data. Pro skutečná data je potřeba implementovat VolumeHistory v backendu.
      </div>
    </div>
  );
};

export default VolumeInTimeChart;

