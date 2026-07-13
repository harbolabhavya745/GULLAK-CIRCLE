import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Member, Transaction } from "../types";

interface ContributionTrendChartProps {
  members: Member[];
  transactions: Transaction[];
}

// A vivid, high-contrast palette — cycles if there are more members than colors.
const LINE_COLORS = [
  "#22D3EE", // cyan
  "#F472B6", // pink
  "#A3E635", // lime
  "#FB923C", // orange
  "#818CF8", // indigo
  "#FACC15", // yellow
  "#34D399", // emerald
  "#F87171", // red
  "#C084FC", // purple
  "#2DD4BF", // teal
];

export const ContributionTrendChart: React.FC<ContributionTrendChartProps> = ({
  members,
  transactions,
}) => {
  const { chartData, memberKeys } = useMemo(() => {
    // Only transactions we can attribute to a member and place on a timeline.
    const usable = transactions.filter((t) => t.userId && t.createdAt);

    if (usable.length === 0 || members.length === 0) {
      return { chartData: [] as Record<string, number | string>[], memberKeys: [] as string[] };
    }

    // Sort chronologically.
    const sorted = [...usable].sort(
      (a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
    );

    // Group into per-day buckets, tracking each member's contribution that day.
    const dayBuckets = new Map<string, Record<string, number>>();
    sorted.forEach((t) => {
      const dateKey = new Date(t.createdAt!).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      if (!dayBuckets.has(dateKey)) dayBuckets.set(dateKey, {});
      const bucket = dayBuckets.get(dateKey)!;
      bucket[t.userId!] = (bucket[t.userId!] || 0) + t.roundup;
    });

    // Build a running cumulative total per member across days, so lines trend upward.
    const runningTotals: Record<string, number> = {};
    members.forEach((m) => (runningTotals[m.id] = 0));

    const data = Array.from(dayBuckets.entries()).map(([date, bucket]) => {
      const row: Record<string, number | string> = { date };
      members.forEach((m) => {
        runningTotals[m.id] += bucket[m.id] || 0;
        row[m.name] = Number(runningTotals[m.id].toFixed(2));
      });
      return row;
    });

    return { chartData: data, memberKeys: members.map((m) => m.name) };
  }, [members, transactions]);

  const hasData = chartData.length > 0;

  return (
    <div className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-sm">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="p-2 bg-gold-500/10 rounded-xl text-gold-500 border border-gold-500/20">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Contribution Trends</h3>
          <p className="text-[11px] text-slate-500 font-mono">
            Cumulative roundups per member over time
          </p>
        </div>
      </div>

      {hasData ? (
        <div className="mt-4 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.08)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={{ stroke: "rgba(212,175,55,0.15)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={{ stroke: "rgba(212,175,55,0.15)" }}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F0F0F",
                  border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#D4AF37", fontWeight: 600 }}
                formatter={(value: number) => [`₹${value.toFixed(2)}`, ""]}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                iconType="circle"
              />
              {memberKeys.map((name, idx) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 2.5, strokeWidth: 0, fill: LINE_COLORS[idx % LINE_COLORS.length] }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-xs text-slate-500 font-mono py-10 text-center">
          Not enough contribution history yet — the chart fills in as members do roundups over time.
        </p>
      )}
    </div>
  );
};
