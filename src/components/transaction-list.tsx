import { Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { getCategory } from "@/lib/categories";
import { currency } from "@/lib/format";
import { txActions, type Transaction } from "@/lib/expense-store";
import { cn } from "@/lib/utils";

export function TransactionList({
  items,
  emptyLabel = "No transactions yet.",
}: {
  items: Transaction[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 py-10 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
      {items.map((t) => {
        const cat = getCategory(t.categoryId);
        const income = t.type === "income";
        return (
          <li
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 first:rounded-t-xl last:rounded-b-xl hover:bg-muted/50"
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
              style={{ background: `color-mix(in oklch, ${cat.color} 15%, transparent)` }}
            >
              {cat.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{cat.name}</span>
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(t.date), "MMM d")}
                </span>
              </div>
              {t.note ? (
                <p className="truncate text-xs text-muted-foreground">{t.note}</p>
              ) : null}
            </div>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                income ? "text-[var(--income)]" : "text-[var(--expense)]",
              )}
            >
              {income ? "+" : "−"}
              {currency(t.amount)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => txActions.remove(t.id)}
              aria-label="Delete transaction"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}