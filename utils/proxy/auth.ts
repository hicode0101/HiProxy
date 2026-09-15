/**
 * HTTP/HTTPS 代理用户名密码认证
 * 原理：监听 webRequest.onAuthRequired，当代理服务器（isProxy=true）质询认证、
 * 且质询方 host:port 与当前生效配置一致时，自动回填存储的凭据。
 *
 * 说明：Chrome 的 onAuthRequired 不覆盖 SOCKS 代理认证，
 * SOCKS5 带认证请继续配合作者的 HiLocalProxy 工具使用。
 *
 * 注意：chrome.* 原生方法必须以 obj.method() 形式调用（不能提取成变量再调用），
 * 否则丢失 receiver 会抛 "Method called without a valid receiver" 并导致 SW 崩溃。
 */
import { browser } from '#imports';
import type { ResolvedTarget } from '@/utils/proxy/engine';

/** 当前生效配置的凭据缓存（background 内存态，配置变化时刷新） */
let authCache: {
  host: string;
  port: number;
  username: string;
  password: string;
} | null = null;

/** 配置应用后刷新凭据缓存 */
export function updateAuthCache(target: ResolvedTarget): void {
  const p = target.profile;
  if (target.mode === 'fixed' && p?.auth?.username) {
    authCache = { host: p.host, port: p.port, username: p.auth.username, password: p.auth.password };
  } else {
    authCache = null;
  }
}

/** 认证质询事件里我们关心的字段 */
interface AuthChallengeDetails {
  isProxy?: boolean;
  challenger?: { host?: string; port?: number };
}

/** 认证结果通过 asyncCallback 异步返回，这里放宽官方联合类型以便透传 */
type AuthListener = (
  details: AuthChallengeDetails,
  asyncCallback?: (response?: unknown) => void,
) => void;

/**
 * 注册认证监听（必须在 background 顶层同步注册，MV3 Service Worker 才能唤醒后继续接收事件）
 */
export function initAuthListener(): void {
  const listener: AuthListener = (details, asyncCallback) => {
    if (
      details.isProxy === true &&
      authCache &&
      details.challenger?.host === authCache.host &&
      details.challenger?.port === authCache.port
    ) {
      asyncCallback?.({
        authCredentials: { username: authCache.username, password: authCache.password },
      });
      return;
    }

    // 与本扩展配置无关的认证 → 回调空结果，交给浏览器默认流程（弹出系统认证框）
    asyncCallback?.();
  };

  browser.webRequest.onAuthRequired.addListener(
    listener as never,
    { urls: ['<all_urls>'] },
    ['asyncBlocking'] as never,
  );
}
