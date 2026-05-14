export type PerformanceDurations = Record<string, number>;

export const compareDurations = (base: PerformanceDurations, target: PerformanceDurations): string => {
  const rows = ['Action | standard_user | performance_glitch_user | difference'];
  for (const key of Object.keys(base)) {
    const standard = base[key] ?? 0;
    const current = target[key] ?? 0;
    const diff = current - standard;
    rows.push(`${key} | ${standard.toFixed(0)}ms | ${current.toFixed(0)}ms | ${diff >= 0 ? '+' : ''}${diff.toFixed(0)}ms`);
  }
  return rows.join('\n');
};

export const measureAction = async <T>(label: string, action: () => Promise<T>, durations: PerformanceDurations): Promise<T> => {
  const start = Date.now();
  const result = await action();
  durations[label] = Date.now() - start;
  return result;
};
