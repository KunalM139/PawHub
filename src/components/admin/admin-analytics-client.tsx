"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

type DailyData = { _id: string; count?: number; totalRevenue?: number };

type AnalyticsProps = {
  usersByDay: DailyData[];
  listingsByDay: DailyData[];
  revenueByDay: DailyData[];
};

export function AdminAnalyticsClient({ analytics }: { analytics: AnalyticsProps }) {
  // Generate a complete 30-day timeline to fill in missing days
  const timeline = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      
      const userDay = analytics.usersByDay.find(x => x._id === dateStr);
      const listingDay = analytics.listingsByDay.find(x => x._id === dateStr);
      const revenueDay = analytics.revenueByDay.find(x => x._id === dateStr);

      data.push({
        date: dateStr,
        users: userDay?.count || 0,
        listings: listingDay?.count || 0,
        revenue: revenueDay?.totalRevenue || 0,
      });
    }
    return data;
  }, [analytics]);

  const totalRevenue = timeline.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-[var(--color-outline-variant)]/30 card-shadow">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Platform Growth (30 Days)</h2>
          <p className="text-sm text-[var(--color-on-surface-variant)]">New Users & Listings over time</p>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" />
              <XAxis dataKey="date" stroke="var(--color-on-surface-variant)" fontSize={12} tickFormatter={(val) => val.split("-").slice(1).join("/")} />
              <YAxis yAxisId="left" stroke="var(--color-primary)" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="users" name="New Users" stroke="var(--color-primary)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="listings" name="New Listings" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[var(--color-outline-variant)]/30 card-shadow">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold">Revenue (30 Days)</h2>
            <p className="text-sm text-[var(--color-on-surface-variant)]">Total amount processed</p>
          </div>
          <div className="text-right">
             <p className="text-2xl font-black text-[var(--color-primary)]">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeline} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" />
              <XAxis dataKey="date" stroke="var(--color-on-surface-variant)" fontSize={12} tickFormatter={(val) => val.split("-").slice(1).join("/")} />
              <YAxis stroke="var(--color-on-surface-variant)" fontSize={12} />
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                 formatter={(value: any) => `₹${(Number(value) || 0).toLocaleString()}`}
              />
              <Bar dataKey="revenue" name="Revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
