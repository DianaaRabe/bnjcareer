// Bounded concurrency helper: enrichment fans out to several URLs per offer, and an
// unbounded Promise.all over those turns one automation run into a burst that looks
// like abuse to the sites being read.

/** Runs `task` over `items` with at most `limit` in flight, preserving input order. */
export async function mapBounded<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  const size = Math.max(1, Math.min(limit, items.length))
  let cursor = 0

  const workers = Array.from({ length: size }, async () => {
    while (true) {
      const index = cursor++
      if (index >= items.length) return
      results[index] = await task(items[index], index)
    }
  })

  await Promise.all(workers)
  return results
}

/** Resolves after `ms` — used between retry attempts. */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
