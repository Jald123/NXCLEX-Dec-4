'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { TrendPoint } from '@nclex/shared-api-types';

interface AccuracyTrendChartProps {
    data: TrendPoint[];
}

export function AccuracyTrendChart({ data }: AccuracyTrendChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Not enough data to show trends yet. Keep practicing!
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                />
                <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
                    labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString();
                    }}
                />
                <ReferenceLine y={75} stroke="#10b981" strokeDasharray="3 3" label="Target" />
                <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label="Minimum" />
                <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

interface DomainRadarData {
    domain: string;
    accuracy: number;
    fullMark: number;
}

interface SimpleRadarChartProps {
    data: DomainRadarData[];
}

export function SimpleRadarChart({ data }: SimpleRadarChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Practice more questions to see domain breakdown
            </div>
        );
    }

    // Simple visual radar using CSS
    const maxAccuracy = 100;
    const centerX = 150;
    const centerY = 150;
    const radius = 120;

    const points = data.map((item, index) => {
        const angle = (index / data.length) * 2 * Math.PI - Math.PI / 2;
        const distance = (item.accuracy / maxAccuracy) * radius;
        return {
            x: centerX + distance * Math.cos(angle),
            y: centerY + distance * Math.sin(angle),
            labelX: centerX + (radius + 30) * Math.cos(angle),
            labelY: centerY + (radius + 30) * Math.sin(angle),
            domain: item.domain,
            accuracy: item.accuracy,
        };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    return (
        <svg width="300" height="300" className="mx-auto">
            {/* Background circles */}
            <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx={centerX} cy={centerY} r={radius * 0.75} fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
            <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
            <circle cx={centerX} cy={centerY} r={radius * 0.25} fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />

            {/* Axes */}
            {points.map((point, index) => (
                <line
                    key={`axis-${index}`}
                    x1={centerX}
                    y1={centerY}
                    x2={centerX + radius * Math.cos((index / data.length) * 2 * Math.PI - Math.PI / 2)}
                    y2={centerY + radius * Math.sin((index / data.length) * 2 * Math.PI - Math.PI / 2)}
                    stroke="#d1d5db"
                    strokeWidth="1"
                />
            ))}

            {/* Data polygon */}
            <path d={pathData} fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="2" />

            {/* Data points */}
            {points.map((point, index) => (
                <circle
                    key={`point-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#3b82f6"
                />
            ))}

            {/* Labels */}
            {points.map((point, index) => (
                <text
                    key={`label-${index}`}
                    x={point.labelX}
                    y={point.labelY}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#374151"
                    fontWeight="500"
                >
                    <tspan x={point.labelX} dy="0">{point.domain}</tspan>
                    <tspan x={point.labelX} dy="12" fill="#6b7280" fontSize="10">{point.accuracy}%</tspan>
                </text>
            ))}
        </svg>
    );
}

interface CalendarDay {
    date: string;
    count: number;
    accuracy: number;
}

interface StudyCalendarProps {
    data: CalendarDay[];
}

export function StudyCalendar({ data }: StudyCalendarProps) {
    // Generate last 12 weeks
    const weeks: CalendarDay[][] = [];
    const today = new Date();

    for (let week = 11; week >= 0; week--) {
        const weekDays: CalendarDay[] = [];
        for (let day = 0; day < 7; day++) {
            const date = new Date(today);
            date.setDate(date.getDate() - (week * 7 + (6 - day)));
            const dateStr = date.toISOString().split('T')[0];
            const dayData = data.find(d => d.date === dateStr);
            weekDays.push(dayData || { date: dateStr, count: 0, accuracy: 0 });
        }
        weeks.push(weekDays);
    }

    const getColor = (count: number): string => {
        if (count === 0) return 'bg-gray-100';
        if (count >= 50) return 'bg-green-600';
        if (count >= 20) return 'bg-green-500';
        if (count >= 10) return 'bg-green-400';
        return 'bg-green-200';
    };

    return (
        <div className="overflow-x-auto">
            <div className="inline-flex gap-1">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day, dayIndex) => (
                            <div
                                key={day.date}
                                className={`w-3 h-3 rounded-sm ${getColor(day.count)} cursor-pointer hover:ring-2 hover:ring-blue-500`}
                                title={`${day.date}: ${day.count} questions${day.count > 0 ? ` (${day.accuracy}%)` : ''}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
                <span>Less</span>
                <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                <span>More</span>
            </div>
        </div>
    );
}
