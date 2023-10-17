export function sumAll(pattern: string, data: Record<string, number>): number {
  let results = 0;

  for (const key of Object.keys(data)) {
    if (key.includes(pattern)) {
      results += data[key];
    }
  }

  return results;
}
