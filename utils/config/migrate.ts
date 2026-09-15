/**
 * 数据迁移
 * - 旧版 3.x 导出文件 / 旧版 storage 遗留键 → v2 配置
 * - 未来 schemaVersion 升级时在 upgrade() 里追加迁移步骤即可
 */
import { uid } from '@/utils/id';
import { DEFAULT_BYPASS, PAC_TEMPLATE } from '@/utils/config/defaults';
import type {
  ExtensionConfig,
  LegacyBackupV1,
  LegacyProfileV1,
  ProxyProfile,
} from '@/types';

/** 判断导出文件是否为旧版 3.x 格式 */
export function isLegacyBackupV1(raw: unknown): raw is LegacyBackupV1 {
  const obj = raw as LegacyBackupV1 | undefined;
  return (
    !!obj &&
    typeof obj === 'object' &&
    typeof obj.Version === 'number' &&
    Array.isArray(obj.ProxyConfigs)
  );
}

/** 判断是否为 v2 备份文件 */
export function isBackupV2(raw: unknown): raw is { config: ExtensionConfig } {
  const obj = raw as { schemaVersion?: number; config?: ExtensionConfig } | null;
  return !!obj && typeof obj === 'object' && obj.schemaVersion === 2 && !!obj.config;
}

/** 旧版单条配置 → v2 ProxyProfile */
export function migrateLegacyProfile(old: LegacyProfileV1): ProxyProfile {
  const rules = old.rules ?? ({} as LegacyProfileV1['rules']);
  const single = rules.singleProxy ?? ({} as LegacyProfileV1['rules']['singleProxy']);
  return {
    id: uid('profile-'),
    name: old.name || old.pid || 'imported',
    color: old.color || '#005FB8',
    scheme: single.scheme ?? 'http',
    host: single.host ?? '127.0.0.1',
    port: Number(single.port) || 8080,
    bypassList: Array.isArray(rules.bypassList) ? rules.bypassList : [...DEFAULT_BYPASS],
  };
}

/** 旧版导出文件 → v2 配置 */
export function migrateLegacyBackup(old: LegacyBackupV1): ExtensionConfig {
  return {
    schemaVersion: 2,
    activeMode: 'direct',
    activeProfileId: null,
    profiles: old.ProxyConfigs.map(migrateLegacyProfile),
    autoRules: [],
    autoFallback: 'direct',
    pacScript: '',
    useLastProxy: old.UseLastProxy === true,
    showBadge: true,
  };
}
