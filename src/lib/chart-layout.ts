/** Financial axes use round intervals and leave headroom for the largest point. */
export function currencyAxis(values: number[]) {
  const maximum = Math.max(1, ...values.filter(Number.isFinite));
  const rough = maximum / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const multiplier =
    [1, 2, 2.5, 5, 10].find((n) => n * magnitude >= rough) || 10;
  const step = Math.max(1, multiplier * magnitude);
  const high = Math.ceil(maximum / step) * step;
  return {
    high,
    step,
    ticks: Array.from(
      { length: Math.round(high / step) + 1 },
      (_, i) => i * step,
    ),
  };
}
