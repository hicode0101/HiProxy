/** 生成稳定唯一 ID（crypto.randomUUID 不可用时退化为随机串） */
export function uid(prefix = 'id-'): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return prefix + c.randomUUID();
  return (
    prefix +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 10)
  );
}
