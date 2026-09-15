import { defineConfig } from 'wxt';

// WXT 构建配置
// 版本号以 package.json 的 version 为唯一来源，此处不再重复维护
export default defineConfig({
  // 输出到 dist（默认 .output 是隐藏目录，upload-artifact 等 CI 步骤默认不匹配点开头目录）
  outDir: 'dist',
  // 关闭 API 自动导入，所有依赖显式 import，代码来源一目了然
  imports: false,
  modules: ['@wxt-dev/module-vue'],
  vite: () => ({
    // 扩展页面禁用 Vite 的 modulepreload 注入：
    // chrome-extension:// 页面下 Chrome 会把 preload 判定为跨 world 资源而忽略，
    // 每次打开页面都会产生两条无害但刺眼的警告
    build: { modulePreload: false },
  }),
  manifest: {
    name: '__MSG_plugin_name__',
    description: '__MSG_plugin_desc__',
    default_locale: 'en',
    minimum_chrome_version: '100',
    author: { email: 'hicode0101@gmail.com' },
    action: {
      default_popup: 'popup.html',
      default_title: '__MSG_plugin_desc__',
    },
    permissions: [
      'proxy',                  // 读写浏览器代理设置（核心能力）
      'storage',                // 配置持久化
      'webRequest',             // 监听代理认证请求
      'webRequestAuthProvider', // 为 HTTP/HTTPS 代理提供用户名密码
    ],
    // webRequest.onAuthRequired 监听全部请求时，MV3 必须声明 host permissions
    host_permissions: ['<all_urls>'],
  },
});
