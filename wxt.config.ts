import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    manifest_version: 3,
    name: "__MSG_plugin_name__",
    description: "__MSG_plugin_desc__",
    default_locale: "en",
    version: "3.1.3",
    minimum_chrome_version: "88.0.0",
    author: "hicode0101@gmail.com",
    action: {
      default_popup: "popup.html",
      default_title: "__MSG_plugin_desc__"
    },
    options_page: "options.html",
    permissions: [
      "notifications",
      "proxy",
      "storage",
      "webRequest",
      "webRequestAuthProvider"
    ],
  },
});
