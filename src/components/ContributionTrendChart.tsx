import React, { useMemo, useState } from "react";
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

type ViewMode = "daily" | "weekly" | "monthly";

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

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

// Monday-start of the calendar week containing `date`.
function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sun ... 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

// Returns a stable sort key + a human label for the bucket a transaction date falls into.
function getBucket(date: Date, viewMode: ViewMode): { key: string; label: string; sortValue: number } {
  if (viewMode === "monthly") {
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    return { key, label, sortValue: date.getFullYear() * 12 + date.getMonth() };
  }
  if (viewMode === "weekly") {
    const start = startOfWeek(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const key = start.toISOString().slice(0, 10);
    const label = `${start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} – ${end.toLocaleDateString(
      "en-IN",
      { day: "2-digit", month: "short" }
    )}`;
    return { key, label, sortValue: start.getTime() };
  }
  // daily
  const key = date.toDateString();
  const label = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  return { key, label, sortValue: new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() };
}

export const ContributionTrendChart: React.FC<ContributionTrendChartProps> = ({
  members,
  transactions,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("daily");

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

    // Group into buckets (day/week/month), tracking each member's contribution per bucket.
    const buckets = new Map<string, { label: string; sortValue: number; totals: Record<string, number> }>();
    sorted.forEach((t) => {
      const { key, label, sortValue } = getBucket(new Date(t.createdAt!), viewMode);
      if (!buckets.has(key)) buckets.set(key, { label, sortValue, totals: {} });
      const bucket = buckets.get(key)!;
      bucket.totals[t.userId!] = (bucket.totals[t.userId!] || 0) + t.roundup;
    });

    // Sort buckets chronologically (not alphabetically by label).
    const orderedBuckets = Array.from(buckets.values()).sort((a, b) => a.sortValue - b.sortValue);

    // Build a running cumulative total per member across buckets, so lines trend upward.
    const runningTotals: Record<string, number> = {};
    members.forEach((m) => (runningTotals[m.id] = 0));

    const data = orderedBuckets.map(({ label, totals }) => {
      const row: Record<string, number | string> = { date: label };
      members.forEach((m) => {
        runningTotals[m.id] += totals[m.id] || 0;
        row[m.name] = Number(runningTotals[m.id].toFixed(2));
      });
      return row;
    });

    return { chartData: data, memberKeys: members.map((m) => m.name) };
  }, [members, transactions, viewMode]);

  const hasData = chartData.length > 0;

  return (
    <div className="p-6 rounded-3xl bg-matte-charcoal border border-gold-500/10 shadow-sm">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
        <div className="flex items-center gap-2.5">
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

        <div className="flex items-center gap-1 p-1 rounded-xl bg-matte-black/50 border border-gold-500/10">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setViewMode(opt.value)}
              aria-pressed={viewMode === opt.value}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono uppercase tracking-wide transition-colors cursor-pointer ${
                viewMode === opt.value
                  ? "bg-gold-500 text-matte-black"
                  : "text-slate-400 hover:text-gold-500"
              }`}
            >
              {opt.label}
            </button>
          ))}
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
                  type="linear"
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

