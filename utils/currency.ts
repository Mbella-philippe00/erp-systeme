export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyInput(amount: number): string {
  return amount.toLocaleString("fr-CM")
}

// Fonction pour convertir les montants d'euros vers francs CFA (approximatif)
export function convertEurToXAF(eurAmount: number): number {
  // 1 EUR ≈ 656 XAF (taux approximatif)
  return Math.round(eurAmount * 656)
}
