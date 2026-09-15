/**
 * PAC 脚本工具
 * - 自动切换模式：把域名规则编译成 PAC 脚本交给 Chrome 执行
 * - PAC 脚本模式：用户自定义脚本 + 默认模板
 *
 * 匹配语义：
 *   example.com      → 仅精确匹配 example.com
 *   *.example.com    → 匹配 example.com 及其所有子域名（推荐写法）
 *   .example.com     → 同 *.example.com
 *   *                → 匹配所有域名
 */
import type { AutoSwitchRule, ExtensionConfig, ProxyProfile } from '@/types';
import { PAC_TEMPLATE } from '@/utils/config/defaults';

/** 把一个代理配置转成 PAC 返回值（如 "PROXY 127.0.0.1:8080" / "SOCKS5 127.0.0.1:1080"） */
export function profileToProxyString(p: ProxyProfile): string {
  const authority = `${p.host}:${p.port}`;
  switch (p.scheme) {
    case 'http':
    case 'https':
      return `PROXY ${authority}`;
    case 'socks4':
      return `SOCKS ${authority}`;
    case 'socks5':
      return `SOCKS5 ${authority}`;
  }
}

/** JS 字符串字面量转义（用户输入的 host / pattern 直接嵌入脚本前必须转义） */
function jsStr(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/**
 * 单条规则 → PAC if 条件表达式
 * 目标是生成人类可读的脚本，方便用户在 chrome://net-internals 里排查
 */
function ruleToCondition(rule: AutoSwitchRule, profile: ProxyProfile | undefined): string | null {
  if (!profile) return null; // 目标配置已被删除
  const pattern = rule.pattern.trim().toLowerCase();
  if (!pattern) return null;

  let cond: string;
  if (pattern === '*') {
    cond = 'true';
  } else if (pattern.startsWith('*.')) {
    const base = pattern.slice(2);
    cond = `host === ${jsStr(base)} || shExpMatch(host, ${jsStr(pattern)})`;
  } else if (pattern.startsWith('.')) {
    const base = pattern.slice(1);
    cond = `host === ${jsStr(base)} || shExpMatch(host, ${jsStr('*' + pattern)})`;
  } else {
    cond = `host === ${jsStr(pattern)}`;
  }
  return `    if (${cond}) return ${jsStr(profileToProxyString(profile))};`;
}

/** 自动切换规则 → 完整 PAC 脚本（注释只用 ASCII：Chrome 的 pacScript.data 不接受中文） */
export function buildAutoPacScript(cfg: ExtensionConfig): string {
  const byId = new Map(cfg.profiles.map((p) => [p.id, p]));

  const lines: string[] = [
    '// HiProxy Auto Switch mode (generated from domain rules, do not edit by hand)',
    `// ${cfg.autoRules.length} rule(s), first match wins`,
    'function FindProxyForURL(url, host) {',
    '  host = host.toLowerCase();',
    '',
    '  // loopback addresses are always direct',
    `  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return 'DIRECT';`,
    '',
  ];

  for (const rule of cfg.autoRules) {
    const line = ruleToCondition(rule, byId.get(rule.target));
    if (line) lines.push(line);
  }

  const fallback =
    cfg.autoFallback === 'direct'
      ? 'DIRECT'
      : profileToProxyString(byId.get(cfg.autoFallback) ?? ({} as ProxyProfile)) || 'DIRECT';
  lines.push('');
  lines.push(`  // default target when no rule matches`);
  lines.push(`  return ${jsStr(fallback)};`);
  lines.push('}');
  return lines.join('\n');
}

/** PAC 内容合法性：Chrome 要求 pacScript.data 只含 ASCII 字符 */
export function isAsciiOnly(script: string): boolean {
  return !/[^\x00-\x7F]/.test(script);
}

/** 用户自定义 PAC 的合法性粗检：必须包含 FindProxyForURL 入口函数 */
export function looksLikeValidPac(script: string): boolean {
  return /function\s+FindProxyForURL\s*\(/.test(script);
}

export { PAC_TEMPLATE };
