/**
 * 深拷贝纯 JSON 配置数据。
 * 刻意不用 structuredClone：Vue 的响应式对象是 Proxy，
 * structuredClone 遇到 Proxy 会直接抛 DataCloneError（曾导致配置无法保存）。
 * 配置数据保证是纯 JSON（无函数 / Date / 循环引用），JSON 序列化最稳妥。
 */
export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
