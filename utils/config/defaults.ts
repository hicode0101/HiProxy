/**
 * 默认配置与场景预设
 * 预设延续 3.x 的 7 个经典配置（Burp / SSH 等常用端口），
 * 新增配置时的"快速模板"也基于这里定义。
 */
import { uid } from '@/utils/id';
import type { AutoSwitchRule, ExtensionConfig, ProxyProfile } from '@/types';

/** 新建配置时循环取用的颜色盘（Win11 强调色系） */
export const PROFILE_COLORS = [
  '#005FB8',
  '#8764B8',
  '#00B294',
  '#C42B1C',
  '#CA5010',
  '#038387',
  '#744DA9',
  '#4C4A48',
];

/** 默认 bypass：本机回环地址不走代理 */
export const DEFAULT_BYPASS = ['127.0.0.1', '::1', 'localhost'];

/** 新建配置的"种子"：必填核心字段，其余可选 */
type ProfileSeed = Partial<ProxyProfile> &
  Pick<ProxyProfile, 'name' | 'color' | 'scheme' | 'host' | 'port'>;

function makeProfile(seed: ProfileSeed): ProxyProfile {
  return {
    bypassList: [...DEFAULT_BYPASS],
    ...seed,
    id: seed.id ?? uid('profile-'),
  };
}

/** 3.x 延续下来的 7 个经典预设 */
export function defaultProfiles(): ProxyProfile[] {
  return [
    makeProfile({
      id: 'preset-http-8080',
      name: 'http-8080',
      color: '#4477bb',
      scheme: 'http',
      host: '127.0.0.1',
      port: 8080,
    }),
    makeProfile({
      id: 'preset-socks5-1080',
      name: 'socks5-1080',
      color: '#8169ff',
      scheme: 'socks5',
      host: '127.0.0.1',
      port: 1080,
    }),
    makeProfile({
      id: 'preset-socks5-10808',
      name: 'socks5-10808',
      color: '#d497ee',
      scheme: 'socks5',
      host: '127.0.0.1',
      port: 10808,
    }),
    makeProfile({
      id: 'preset-socks5-7891',
      name: 'socks5-7891',
      color: '#9117c5',
      scheme: 'socks5',
      host: '127.0.0.1',
      port: 7891,
    }),
    makeProfile({
      id: 'preset-http-7890',
      name: 'http-7890',
      color: '#0b4da4',
      scheme: 'http',
      host: '127.0.0.1',
      port: 7890,
    }),
    // Burp 抓包场景：顺带排除 Google / 字节系统计域名，防止遥测流量灌进 Burp
    makeProfile({
      id: 'preset-burp-8080',
      name: 'burp-8080',
      color: '#55bb55',
      scheme: 'http',
      host: '127.0.0.1',
      port: 8080,
      bypassList: [
        '127.0.0.1',
        '::1',
        'localhost',
        '.google.com',
        '.google-analytics.com',
        '.googleapis.com',
        'mcs.volceapplog.com',
        'mssdk.bytedance.com',
        'mcs.zijieapi.com',
        'mon.zijieapi.com',
      ],
    }),
    // 本地应用抓包场景：<-loopback> 反转语义，让 localhost 流量也走代理
    makeProfile({
      id: 'preset-loop-8080',
      name: 'loop-8080',
      color: '#8892AB',
      scheme: 'http',
      host: '127.0.0.1',
      port: 8080,
      bypassList: ['<-loopback>'],
    }),
  ];
}

/** PAC 脚本模式的默认模板（用户可在 PAC 页编辑；内容必须为纯 ASCII，Chrome 不接受中文注释） */
export const PAC_TEMPLATE = `// HiProxy PAC script mode
// Custom PAC script. The entry function must be FindProxyForURL(url, host)
// NOTE: Chrome only accepts ASCII characters here (no Chinese comments).
//
// Example: route *.google.com through local proxy 7890, everything else direct
//
// function FindProxyForURL(url, host) {
//   if (shExpMatch(host, '*.google.com')) return 'PROXY 127.0.0.1:7890';
//   return 'DIRECT';
// }

function FindProxyForURL(url, host) {
  host = host.toLowerCase();

  // TODO: add your routing rules here

  return 'DIRECT';
}
`;

/** 全新安装 / 手动重置时的完整默认配置 */
export function defaultConfig(): ExtensionConfig {
  return {
    schemaVersion: 2,
    activeMode: 'direct',
    activeProfileId: null,
    profiles: defaultProfiles(),
    autoRules: [],
    autoFallback: 'direct',
    pacScript: PAC_TEMPLATE,
    useLastProxy: false,
    showBadge: true,
    uiLocale: 'auto',
  };
}

/** "快速新增"模板：常见安全工具端口一键创建 */
export interface ProfileTemplate {
  key: string;
  labelKey: string;
  build: () => ProxyProfile;
}

export const PROFILE_TEMPLATES: ProfileTemplate[] = [
  {
    key: 'burp',
    labelKey: 'profiles_tpl_burp',
    build: () =>
      makeProfile({ name: 'burp-8080', color: '#55bb55', scheme: 'http', host: '127.0.0.1', port: 8080 }),
  },
  {
    key: 'http-7890',
    labelKey: 'profiles_tpl_http_7890',
    build: () =>
      makeProfile({ name: 'http-7890', color: '#0b4da4', scheme: 'http', host: '127.0.0.1', port: 7890 }),
  },
  {
    key: 'socks5-7891',
    labelKey: 'profiles_tpl_socks5_7891',
    build: () =>
      makeProfile({ name: 'socks5-7891', color: '#9117c5', scheme: 'socks5', host: '127.0.0.1', port: 7891 }),
  },
  {
    key: 'socks5-10808',
    labelKey: 'profiles_tpl_socks5_10808',
    build: () =>
      makeProfile({ name: 'socks5-10808', color: '#d497ee', scheme: 'socks5', host: '127.0.0.1', port: 10808 }),
  },
  {
    key: 'ssh',
    labelKey: 'profiles_tpl_ssh',
    build: () =>
      makeProfile({ name: 'socks5-1080', color: '#8169ff', scheme: 'socks5', host: '127.0.0.1', port: 1080 }),
  },
  {
    key: 'blank',
    labelKey: 'profiles_tpl_blank',
    build: () =>
      makeProfile({ name: '', color: PROFILE_COLORS[0], scheme: 'http', host: '127.0.0.1', port: 8080 }),
  },
];

/** 自动切换的一条空规则（UI 新增时用） */
export function emptyAutoRule(): AutoSwitchRule {
  return { id: uid('rule-'), pattern: '', target: 'direct' };
}
