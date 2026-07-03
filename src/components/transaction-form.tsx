import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CATEGORIES, type TxType } from "@/lib/categories";
import { txActions } from "@/lib/expense-store";
import { cn } from "@/lib/utils";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be greater than 0").max(1_000_000),
  categoryId: z.string().min(1, "Pick a category"),
  note: z.string().trim().max(140, "Keep it under 140 chars"),
  date: z.string().min(1, "Pick a date"),
});

export function TransactionForm({ onDone }: { onDone?: () => void }) {
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const cats = CATEGORIES.filter((c) => c.type === type);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({
      type,
      amount: Number(amount),
      categoryId,
      note,
      date,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your inputs");
      return;
    }
    txActions.add(parsed.data);
    toast.success(`${type === "income" ? "Income" : "Expense"} added`);
    setAmount("");
    setNote("");
    setCategoryId("");
    onDone?.();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              setCategoryId("");
            }}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium capitalize transition-all",
              type === t
                ? t === "income"
                  ? "bg-card text-foreground shadow-sm ring-1 ring-[var(--income)]/30"
                  : "bg-card text-foreground shadow-sm ring-1 ring-[var(--expense)]/30"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-7 text-lg font-semibold"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {cats.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className="mr-2">{c.emoji}</span>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What was it for?"
          rows={2}
          maxLength={140}
        />
      </div>

      <Button type="submit" className="w-full" size="lg">
        Add {type}
      </Button>
    </form>
  );
}