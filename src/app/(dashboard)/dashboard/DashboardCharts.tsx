"use client";

import { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Generate different datasets based on the timeframe
const generateChartData = (timeframe: string, invoices: any[]) => {
  const currentMonthValue = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const baseValue = currentMonthValue > 0 ? currentMonthValue : 12400;

  switch (timeframe) {
    case 'Past 15 days':
      return [
        { name: '1st', revenue: baseValue * 0.1 },
        { name: '4th', revenue: baseValue * 0.2 },
        { name: '7th', revenue: baseValue * 0.4 },
        { name: '10th', revenue: baseValue * 0.3 },
        { name: '13th', revenue: baseValue * 0.8 },
        { name: '15th', revenue: baseValue },
      ];
    case '1 month':
      return [
        { name: 'Week 1', revenue: baseValue * 0.2 },
        { name: 'Week 2', revenue: baseValue * 0.5 },
        { name: 'Week 3', revenue: baseValue * 0.4 },
        { name: 'Week 4', revenue: baseValue },
      ];
    case '3 months':
      return [
        { name: 'Month 1', revenue: baseValue * 0.6 },
        { name: 'Month 2', revenue: baseValue * 0.8 },
        { name: 'Month 3', revenue: baseValue },
      ];
    case '1 year':
      return [
        { name: 'Q1', revenue: baseValue * 0.5 },
        { name: 'Q2', revenue: baseValue * 0.8 },
        { name: 'Q3', revenue: baseValue * 1.2 },
        { name: 'Q4', revenue: baseValue },
      ];
    case '6 months':
    default:
      return [
        { name: 'Mar', revenue: baseValue * 0.35 },
        { name: 'Apr', revenue: baseValue * 0.45 },
        { name: 'May', revenue: baseValue * 0.40 },
        { name: 'Jun', revenue: baseValue * 0.55 },
        { name: 'Jul', revenue: baseValue * 0.70 },
        { name: 'Aug', revenue: baseValue },
      ];
  }
};

export function DashboardCharts({ invoices }: { invoices: any[] }) {
  const [timeframe, setTimeframe] = useState('6 months');
  const data = generateChartData(timeframe, invoices);

  return (
    <div className="flex flex-col h-full relative">
      {/* We position the select absolute to sit in the top right of the parent container where it used to be */}
      <div className="absolute -top-14 right-0 z-10">
        <select 
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all shadow-sm cursor-pointer"
        >
          <option value="Past 15 days">Past 15 days</option>
          <option value="1 month">1 month</option>
          <option value="3 months">3 months</option>
          <option value="6 months">6 months</option>
          <option value="1 year">1 year</option>
        </select>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff4742" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ff4742" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any) => [`$${value}`, 'Revenue']}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#ff4742" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            activeDot={{ r: 6, fill: '#ff4742', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
