export function formatCurrency(value?: number | string | null, currency = 'MZN') {
  if (value === null || value === undefined) return '-';
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return '-';
  return num.toLocaleString('pt-BR', { style: 'currency', currency });
}

export function formatNumber(value?: number | string | null) {
  if (value === null || value === undefined) return '0';
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString('pt-BR');
}

export function safeMultiply(a?: number | string | null, b?: number | string | null) {
  const na = (a === null || a === undefined) ? 0 : Number(a);
  const nb = (b === null || b === undefined) ? 0 : Number(b);
  if (Number.isNaN(na) || Number.isNaN(nb)) return 0;
  return na * nb;
}

export function formatDateTime(value?: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  if (!value) return '-';
  const d = value instanceof Date ? value : new Date(value as any);
  if (Number.isNaN(d.getTime())) return '-';
  const defaultOpts: Intl.DateTimeFormatOptions = options ?? { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return d.toLocaleDateString('pt-BR', defaultOpts);
}

export default {
  formatCurrency,
  formatNumber,
  safeMultiply,
  formatDateTime,
};