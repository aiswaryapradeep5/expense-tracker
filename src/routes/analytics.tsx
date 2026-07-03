import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions } from "@/lib/expense-store";
import {
  categoryBreakdown,
  inYear,
  listYears,
  monthlyBreakdown,
  totalsFor,
} from "@/lib/aggregations";
import { currency } from "@/lib/format";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Ledgerly" },
      {
        name: "description",
        content: "Yearly summaries, category breakdowns, and spending trends.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const txs = useTransactions();
  const years = listYears(txs);
  const [year, setYear] = useState<number>(years[0]);

  const yearTx = useMemo(() => txs.filter((t) => inYear(t, year)), [txs, year]);
  const totals = useMemo(() => totalsFor(yearTx), [yearTx]);
  const monthly = useMemo(() => monthlyBreakdown(txs, year), [txs, year]);
  const expenseBy = useMemo(() => categoryBreakdown(yearTx, "expense"), [yearTx]);
  const incomeBy = useMemo(() => categoryBreakdown(yearTx, "income"), [yearTx]);
  const savingsRate =
    totals.income > 0 ? Math.max(0, (totals.balance / totals.income) * 100) : 0;

  return (
    <AppShell>
      <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Yearly summary and category insights
          </p>
        </div>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="grid gap-4 sm:grid-cols-4">
        <Stat label={`Income ${year}`} value={currency(totals.income)} tone="income" />
        <Stat label={`Expenses ${year}`} value={currency(totals.expense)} tone="expense" />
        <Stat label="Net" value={currency(totals.balance)} />
        <Stat label="Savings rate" value={`${savingsRate.toFixed(0)}%`} />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="Income vs. expenses" subtitle="Monthly">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} barCategoryGap={10}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => `$${Math.round(v / 100) / 10}k`}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={tooltipStyle}
                  formatter={(v) => currency(Number(v))}
                />
                <Bar dataKey="income" fill="var(--income)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="var(--expense)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Net cash flow" subtitle="Monthly">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => `$${Math.round(v / 100) / 10}k`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => currency(Number(v))}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "var(--primary)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Expense categories" subtitle="Year to date">
          <BreakdownChart data={expenseBy} />
        </Card>
        <Card title="Income sources" subtitle="Year to date">
          <BreakdownChart data={incomeBy} />
        </Card>
      </section>
    </AppShell>
  );
}

const tooltipStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  fontSize: 12,
};

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "income" | "expense";
}) {
  const color =
    tone === "income"
      ? "text-[var(--income)]"
      : tone === "expense"
        ? "text-[var(--expense)]"
        : "text-foreground";
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold tracking-tight tabular-nums ${color}`}>
        {value}
      </p>
    </div>
  );
}

function BreakdownChart({
  data,
}: {
  data: ReturnType<typeof categoryBreakdown>;
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
        No data yet.
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-[160px_1fr] items-center">
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={38}
              outerRadius={68}
              paddingAngle={2}
            >
              {data.map((s) => (
                <Cell key={s.categoryId} fill={s.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => currency(Number(v))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1.5 text-sm">
        {data.slice(0, 6).map((s) => (
          <li key={s.categoryId} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="flex-1 truncate">
              {s.emoji} {s.name}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {Math.round(s.pct * 100)}%
            </span>
            <span className="tabular-nums font-medium">{currency(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}