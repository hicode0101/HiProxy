/**
 * 配置校验
 * - validateProfileIssues：单条配置的字段校验（UI 行内红框 + 保存拦截）
 * - parseBackupFile：导入文件的结构校验（支持 v2 / 旧版 v1，非法输入直接拒绝）
 */
import { defaultConfig, PAC_TEMPLATE } from '@/utils/config/defaults';
import {
  isBackupV2,
  isLegacyBackupV1,
  migrateLegacyBackup,
} from '@/utils/config/migrate';
import type { ExtensionConfig, ProxyProfile } from '@/types';

/** 单条配置的字段级问题（msgKey 对应 _locales 文案） */
export interface ProfileIssue {
  field: 'name' | 'host' | 'port';
  msgKey: string;
}

/** 校验单条代理配置，返回问题列表（空数组 = 合法） */
export function validateProfileIssues(p: ProxyProfile): ProfileIssue[] {
  const issues: ProfileIssue[] = [];
  if (!p.name || !p.name.trim()) {
    issues.push({ field: 'name', msgKey: 'profiles_err_name_empty' });
  }
  if (!p.host || !p.host.trim()) {
    issues.push({ field: 'host', msgKey: 'profiles_err_host_empty' });
  }
  const port = Number(p.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    issues.push({ field: 'port', msgKey: 'profiles_err_port_invalid' });
  }
  return issues;
}

/** 校验整个配置列表：返回 [行索引, 问题列表]，另外检查重名 */
export function validateProfileList(
  profiles: ProxyProfile[],
): Map<number, ProfileIssue[]> {
  const result = new Map<number, ProfileIssue[]>();
  const nameCount = new Map<string, number>();
  profiles.forEach((p) => {
    const name = p.name?.trim() ?? '';
    if (name) nameCount.set(name, (nameCount.get(name) ?? 0) + 1);
  });

  profiles.forEach((p, index) => {
    const issues = validateProfileIssues(p);
    if (p.name?.trim() && (nameCount.get(p.name.trim()) ?? 0) > 1) {
      issues.push({ field: 'name', msgKey: 'profiles_err_name_dup' });
    }
    if (issues.length) result.set(index, issues);
  });
  return result;
}

/** 导入解析结果 */
export type BackupParseResult =
  | { ok: true; config: ExtensionConfig; legacy: boolean }
  | { ok: false; error: string };

/**
 * 解析导入的备份文件内容（JSON 字符串）
 * 自动识别 v2 / 旧版 v1(Version:319) 两种格式
 */
export function parseBackupFile(content: string): BackupParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    return { ok: false, error: 'io_err_not_json' };
  }

  if (isBackupV2(raw)) {
    return { ok: true, config: raw.config, legacy: false };
  }
  if (isLegacyBackupV1(raw)) {
    return { ok: true, config: migrateLegacyBackup(raw), legacy: true };
  }
  return { ok: false, error: 'io_err_unknown_format' };
}

/** 导出文件对象（v2） */
export function buildBackupFile(config: ExtensionConfig) {
  return {
    app: 'HiProxy' as const,
    schemaVersion: 2 as const,
    exportedAt: new Date().toISOString(),
    config,
  };
}

// re-export 便于上层只 import 这一个入口
export { defaultConfig, PAC_TEMPLATE };
