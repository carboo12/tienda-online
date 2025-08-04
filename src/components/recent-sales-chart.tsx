
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export interface SalesData {
    name: string;
    total: number;
}

interface RecentSalesChartProps {
    data: SalesData[];
}

export function RecentSalesChart({ data }: RecentSalesChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">No hay ventas en los últimos 7 días.</p>
            </div>
        );
    }
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `C$${value}`}
                />
                 <Tooltip
                    contentStyle={{
                        borderRadius: "0.5rem",
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--background))"
                    }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
