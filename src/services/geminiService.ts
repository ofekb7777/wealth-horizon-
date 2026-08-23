import { Transaction, Account, Investment, Goal, SpreadsheetState } from "../types";

export async function getFinancialInsights(state: SpreadsheetState): Promise<string> {
  const totalBalance = (state.accounts || []).reduce((sum, acc) => sum + acc.balance, 0);
  const totalInvValue = (state.investments || []).reduce((sum, inv) => sum + (inv.shares * inv.currentPrice), 0);
  
  const summary = {
    netWorth: totalBalance + totalInvValue,
    cashReserve: totalBalance,
    investments: (state.investments || []).map(inv => ({
      ticker: inv.ticker,
      gainPercent: inv.avgPrice > 0 ? ((inv.currentPrice - inv.avgPrice) / inv.avgPrice) * 100 : 0,
      value: inv.shares * inv.currentPrice
    })),
    recentSpend: (state.transactions || []).filter(t => t.amount < 0).slice(0, 10).map(t => ({
      cat: t.category,
      amount: Math.abs(t.amount)
    })),
    goals: (state.goals || []).map(g => ({
      name: g.name,
      completion: g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
    }))
  };

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini Proxy Error:", error);
    return "[]";
  }
}
