export type TxType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  type: TxType;
  emoji: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "salary", name: "Salary", type: "income", emoji: "💼", color: "var(--chart-1)" },
  { id: "freelance", name: "Freelance", type: "income", emoji: "🧑‍💻", color: "var(--chart-2)" },
  { id: "investment", name: "Investments", type: "income", emoji: "📈", color: "var(--chart-3)" },
  { id: "gift", name: "Gifts", type: "income", emoji: "🎁", color: "var(--chart-5)" },
  { id: "other-income", name: "Other Income", type: "income", emoji: "💰", color: "var(--chart-4)" },

  { id: "food", name: "Food & Dining", type: "expense", emoji: "🍽️", color: "var(--chart-4)" },
  { id: "transport", name: "Transport", type: "expense", emoji: "🚗", color: "var(--chart-2)" },
  { id: "housing", name: "Housing", type: "expense", emoji: "🏠", color: "var(--chart-3)" },
  { id: "utilities", name: "Utilities", type: "expense", emoji: "💡", color: "var(--chart-5)" },
  { id: "shopping", name: "Shopping", type: "expense", emoji: "🛍️", color: "var(--chart-1)" },
  { id: "entertainment", name: "Entertainment", type: "expense", emoji: "🎬", color: "var(--chart-2)" },
  { id: "health", name: "Health", type: "expense", emoji: "🩺", color: "var(--chart-3)" },
  { id: "education", name: "Education", type: "expense", emoji: "📚", color: "var(--chart-4)" },
  { id: "travel", name: "Travel", type: "expense", emoji: "✈️", color: "var(--chart-5)" },
  { id: "other-expense", name: "Other", type: "expense", emoji: "🧾", color: "var(--chart-1)" },
];

export const getCategory = (id: string) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];