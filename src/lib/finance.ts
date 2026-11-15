export function mortgage(price: number, downPct: number, ratePct: number, years: number) {
  const loan = Math.max(0, price * (1 - downPct / 100));
  const n = Math.max(1, Math.round(years * 12));
  const r = ratePct / 100 / 12;
  const monthly = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n));
  return { loan, monthly, totalInterest: monthly * n - loan };
}

export function rentalYield(price: number, annualRent: number, serviceCharges: number, otherCosts: number) {
  if (price <= 0) return { gross: 0, net: 0, netIncome: 0, payback: 0 };
  const netIncome = annualRent - serviceCharges - otherCosts;
  return {
    gross: (annualRent / price) * 100,
    net: (netIncome / price) * 100,
    netIncome,
    payback: netIncome > 0 ? price / netIncome : 0,
  };
}

export const formatAED = (v: number) => "AED " + Math.round(v).toLocaleString("en-US");
