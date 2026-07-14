export function currency(value, ccy = 'EUR') {
  const n = Number(value) || 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy }).format(n);
}

export function number(value) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}

export function percent(value, digits = 1) {
  return `${(Number(value) || 0).toFixed(digits)}%`;
}

export function shortDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
