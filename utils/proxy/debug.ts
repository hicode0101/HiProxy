/**
 * 诊断日志：background 的执行轨迹写入 storage.local 的 debugLog 键，
 * 便于在扩展页面（options console）里查看 SW 内部发生了什么。
 * 仅用于排查问题，正式版可整体移除。
 */
import { browser } from '#imports';

const LOG_KEY = 'debugLog';

export async function appendLog(msg: string): Promise<void> {
  try {
    const d = await browser.storage.local.get(LOG_KEY);
    const arr: string[] = Array.isArray(d[LOG_KEY]) ? d[LOG_KEY] : [];
    arr.push(`${new Date().toISOString().slice(11, 19)} ${msg}`);
    await browser.storage.local.set({ [LOG_KEY]: arr.slice(-80) });
  } catch (e) {
    console.error('[HiProxy][debug] appendLog failed', e);
  }
}
