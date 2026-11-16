import { Download, ExternalLink, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { cheerFund } from "@/lib/cheer";
import { fmtMoney } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";

export function FundsView() {
  const { funds, goals, addFund, deleteFund, updateGoalTarget, exportFundsLedger, currency } = useStore();
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");

  const income = funds.filter((f) => f.type === "income").reduce((n, f) => n + f.amount, 0);
  const expense = funds.filter((f) => f.type === "expense").reduce((n, f) => n + f.amount, 0);
  const balance = income - expense;

  const submit = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    addFund(label, type, val);
    cheerFund(type, val, label);
    setLabel("");
    setAmount("");
  };

  const handleDelete = (id: string, lbl: string) => {
    deleteFund(id);
    toast.info(`Deleted transaction: ${lbl}`);
  };

  return (
    <div className="space-y-6">
      <section className="paper-card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current balance</p>
        <p className={`mt-2 font-display text-4xl sm:text-5xl ${balance < 0 ? "text-destructive" : ""}`}>
          {fmtMoney(balance, currency)}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" /> in {fmtMoney(income, currency)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TrendingDown className="h-4 w-4 text-destructive" /> out {fmtMoney(expense, currency)}
          </span>
        </div>
        <p className="mt-4 max-w-prose text-sm text-muted-foreground">
          Broke is a starting balance, not a verdict. Every entry here moves a real number toward a real exam.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((Math.max(0, balance) / g.target) * 100));
          return (
            <div key={g.id} className="paper-card p-6">
              <p className="text-sm font-bold">{g.label}</p>
              {g.note && <p className="mt-1 text-xs font-semibold text-muted-foreground">{g.note}</p>}
              <p className="mt-3 font-display text-2xl">
                {fmtMoney(Math.max(0, balance), currency)}{" "}
                <span className="text-sm text-muted-foreground">/ {fmtMoney(g.target, currency)}</span>
              </p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{pct}% funded</p>
              <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                Target:
                <input
                  type="number"
                  min={1}
                  defaultValue={g.target}
                  onBlur={(e) => {
                    const parsed = parseFloat(e.target.value);
                    if (parsed && parsed > 0) {
                      updateGoalTarget(g.id, parsed);
                      toast.success(`Updated ${g.label} target to ${fmtMoney(parsed, currency)}`);
                    }
                  }}
                  className="w-32 rounded-xl border border-input bg-background px-2 py-1 font-bold outline-none focus:border-primary"
                  aria-label={`${g.label} target`}
                />
              </label>
            </div>
          );
        })}
      </section>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="paper-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Freelance gig / Study materials"
          className="min-h-11 flex-1 rounded-2xl border border-input bg-background px-4 text-sm font-semibold outline-none placeholder:text-muted-foreground/70 focus:border-primary"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "income" | "expense")}
          className="min-h-11 cursor-pointer rounded-2xl border border-input bg-background px-4 text-sm font-bold outline-none focus:border-primary"
          aria-label="Type"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="number"
          min={0}
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="min-h-11 w-32 rounded-2xl border border-input bg-background px-4 text-sm font-bold outline-none focus:border-primary"
          aria-label="Amount"
        />
        <button
          type="submit"
          disabled={!label.trim() || !parseFloat(amount)}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-transform duration-200 hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" strokeWidth={3} /> Add Entry
        </button>
      </form>

      <section className="paper-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Transactions</p>
          {funds.length > 0 && (
            <button
              onClick={() => {
                exportFundsLedger();
                toast.success("Funds ledger exported as CSV!");
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          )}
        </div>

        <div className="divide-y divide-border">
          {funds.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No money moves logged. Record income and expenses — small amounts count.
            </p>
          ) : (
            [...funds]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 40)
              .map((f) => (
                <div key={f.id} className="flex items-center gap-3 px-4 py-3 sm:px-6">
                  <span
                    className={`inline-flex w-16 shrink-0 items-center justify-center rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${
                      f.type === "income" ? "bg-primary/15 text-primary" : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {f.type}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{f.label}</p>
                    <p className="text-xs font-semibold text-muted-foreground">{f.date}</p>
                  </div>
                  <span className={`ml-auto shrink-0 font-display text-sm ${f.type === "income" ? "" : "text-destructive"}`}>
                    {f.type === "income" ? "+" : "−"}{fmtMoney(f.amount, currency)}
                  </span>
                  <button
                    onClick={() => handleDelete(f.id, f.label)}
                    aria-label={`Delete ${f.label}`}
                    className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/25 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
          )}
        </div>
      </section>

      <section className="paper-card p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Free while broke</p>
        <ul className="mt-3 space-y-2 text-sm font-semibold">
          <li>
            <a className="inline-flex items-center gap-1 text-primary hover:underline" href="https://www.britishcouncil.org.ng" target="_blank" rel="noreferrer">
              British Council Nigeria — IELTS Academic information <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </li>
          <li>
            <a className="inline-flex items-center gap-1 text-primary hover:underline" href="https://www.topik.go.kr" target="_blank" rel="noreferrer">
              topik.go.kr — official past papers with audio <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </li>
          <li>
            <a className="inline-flex items-center gap-1 text-primary hover:underline" href="https://overseas.mofa.go.kr/ng-en/index.do" target="_blank" rel="noreferrer">
              Embassy of the Republic of Korea in Abuja, Nigeria <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </li>
          <li>
            <a className="inline-flex items-center gap-1 text-primary hover:underline" href="https://www.studyinkorea.go.kr" target="_blank" rel="noreferrer">
              Study in Korea — GKS official notice board (check weekly) <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
