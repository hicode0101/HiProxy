/**
 * 配置持久化层
 * 只负责"读写 + 变更通知"这一件事，不包含任何业务逻辑；
 * 所有键值集中在 local:config 一个根对象上，配合 schemaVersion 做版本迁移。
 */
import { storage } from '#imports';
import type { ExtensionConfig } from '@/types';

/** 根配置项（storage.local 中仅此一个业务键 + 旧版遗留键） */
const configItem = storage.defineItem<ExtensionConfig | null>('local:config', {
  fallback: null,
});

/** 读取根配置，尚未初始化时返回 null */
export async function readRawConfig(): Promise<ExtensionConfig | null> {
  return await configItem.getValue();
}

/** 写入根配置 */
export async function writeRawConfig(cfg: ExtensionConfig): Promise<void> {
  await configItem.setValue(cfg);
}

/**
 * 监听根配置变化（跨 popup / options / background 同步的桥梁）
 * 返回取消监听函数
 */
export function watchRawConfig(
  onChange: (next: ExtensionConfig | null) => void,
): () => void {
  return configItem.watch((next) => onChange(next));
}

/** 读取旧版遗留的原始键（用于一次性迁移，不做清理以兼容降级场景） */
export async function readLegacyKeys(): Promise<{
  proxyConfigs: string | null;
  useLastProxy: boolean | null;
}> {
  const legacyProxyConfigs = storage.defineItem<string | null>('local:proxyConfigs', {
    fallback: null,
  });
  const legacyUseLastProxy = storage.defineItem<boolean | null>('local:useLastProxy', {
    fallback: null,
  });
  return {
    proxyConfigs: await legacyProxyConfigs.getValue(),
    useLastProxy: await legacyUseLastProxy.getValue(),
  };
}
