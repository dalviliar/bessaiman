// Postgres numeric columns (price and friends) come back from the driver
// as strings, not numbers, even though the TS types claim `number` — a
// bare `.toLocaleString()` on one of those is a silent no-op, showing the
// raw unformatted digits instead of grouped thousands. Route every price
// display through this so the coercion happens exactly once.
export function formatKzt(value: number | string | null | undefined): string {
  return Number(value ?? 0).toLocaleString('ru-RU')
}
