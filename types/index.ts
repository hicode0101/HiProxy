/**
 * HiProxy 领域类型定义
 * 全部配置以一个 ExtensionConfig 根对象存放在 storage.local 中，
 * 带 schemaVersion 便于后续版本迁移。
 */

/** 代理协议类型 */
export type ProxyScheme = 'http' | 'https' | 'socks4' | 'socks5';

/** 代理认证凭据（HTTP/HTTPS 代理原生生效；SOCKS5 认证受 Chrome 限制，需配合 HiLocalProxy） */
export interface ProxyAuth {
  username: string;
  password: string;
}

/**
 * 一个代理服务器配置
 * 注意：id 是稳定唯一标识（与 name 解耦），重命名不会破坏"当前激活"等引用关系
 */
export interface ProxyProfile {
  id: string;
  name: string;          // 显示名称，保存时要求唯一
  color: string;         // 工具栏图标 / 列表色块颜色（hex）
  scheme: ProxyScheme;
  host: string;
  port: number;
  bypassList: string[];  // 不经过代理的主机表达式列表
  auth?: ProxyAuth;      // 可选认证信息
}

/** 自动切换规则的目标：'direct' 表示直连，其它值为 ProxyProfile.id */
export type RuleTarget = 'direct' | string;

/** 自动切换规则：host 命中 pattern 时使用 target 对应的代理 */
export interface AutoSwitchRule {
  id: string;
  pattern: string;  // 域名匹配表达式，如 *.google.com、10.0.0.0/8 说明见文档页
  target: RuleTarget;
}

/** 代理工作模式 */
export type ProxyMode =
  | 'direct'  // 直接连接
  | 'system'  // 跟随系统代理
  | 'fixed'   // 固定服务器（使用 activeProfileId 指向的配置）
  | 'auto'    // 自动切换（按域名规则生成 PAC）
  | 'pac';    // PAC 脚本（使用用户自定义脚本）

/**
 * 界面语言设置
 * 'auto' 跟随浏览器语言；'en' / 'zh_CN' 手动指定（chrome.i18n 不支持运行时切换，
 * 手动模式由 utils/i18n 自行加载对应 _locales 资源实现）
 */
export type UiLocaleSetting = 'auto' | 'en' | 'zh_CN';

/** 扩展完整配置（v2） */
export interface ExtensionConfig {
  schemaVersion: 2;
  activeMode: ProxyMode;
  activeProfileId: string | null;   // fixed 模式下使用的配置 id
  profiles: ProxyProfile[];
  autoRules: AutoSwitchRule[];      // 顺序即匹配优先级
  autoFallback: RuleTarget;         // 自动切换未命中任何规则时的目标
  pacScript: string;                // pac 模式脚本内容
  useLastProxy: boolean;            // 浏览器启动时是否恢复上次使用的代理
  showBadge: boolean;               // 是否在工具栏图标上显示模式徽标
  uiLocale: UiLocaleSetting;        // 界面语言（其它配置页可切换）
}

/** 导出备份文件格式（v2） */
export interface BackupFileV2 {
  app: 'HiProxy';
  schemaVersion: 2;
  exportedAt: string; // ISO 时间
  config: ExtensionConfig;
}

/** 旧版（3.x）单条配置的原始结构，仅用于导入迁移 */
export interface LegacyProfileV1 {
  pid: string;
  name: string;
  color: string;
  mode: string;
  rules: {
    singleProxy: { scheme: ProxyScheme; host: string; port: number };
    bypassList: string[];
  };
}

/** 旧版（3.x）导出文件结构，仅用于导入迁移 */
export interface LegacyBackupV1 {
  Version: number; // 旧版固定为 319
  UseLastProxy: boolean;
  ProxyConfigs: LegacyProfileV1[];
}
