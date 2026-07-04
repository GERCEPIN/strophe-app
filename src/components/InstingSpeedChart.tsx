"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface WeekData {
  week: string;
  avgDecisionMs: number;
  accuracy: number;
  attempts: number;
}

export function InstingSpeedChart() {
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insting/speed-log")
      .then((r) => r.json())
      .then((d) => setWeeks(d.weeks ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-[var(--strophe-text-muted)]">Memuat...</p>
    );
  }

  if (weeks.length === 0) {
    return (
      <p className="text-sm text-[var(--strophe-text-muted)]">
        Belum ada data latihan insting.
      </p>
    );
  }

  const chartData = weeks.map((w) => ({
    week: w.week,
    avgDecisionMs: w.avgDecisionMs,
    accuracy: Math.round(w.accuracy * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: "var(--strophe-text-muted)" }}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          tickFormatter={(v: number) => `${v}ms`}
          tick={{ fontSize: 11, fill: "var(--strophe-text-muted)" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(v: number) => `${v}%`}
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "var(--strophe-text-muted)" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--strophe-surface)",
            border: "1px solid var(--strophe-border)",
            borderRadius: 8,
          }}
          labelStyle={{ color: "var(--strophe-text-muted)", fontSize: 11 }}
          formatter={(value, name) => {
            const v = Number(value);
            if (name === "avgDecisionMs") return [`${v}ms`, "Rata-rata waktu"];
            if (name === "accuracy") return [`${v}%`, "Akurasi"];
            return [value, String(name)];
          }}
        />
        <Legend
          formatter={(value) => {
            if (value === "avgDecisionMs") return "Rata-rata waktu keputusan";
            if (value === "accuracy") return "Akurasi (%)";
            return value;
          }}
          wrapperStyle={{ fontSize: 12, color: "var(--strophe-text-muted)" }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="avgDecisionMs"
          stroke="var(--strophe-gold)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--strophe-gold)" }}
          activeDot={{ r: 5 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="accuracy"
          stroke="var(--strophe-success)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--strophe-success)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
