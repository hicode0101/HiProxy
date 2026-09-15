<script setup lang="ts">
/**
 * 通配符说明文档 Tab
 * 静态文档页：1. bypassList 主机通配符（Chrome proxy API 官方语义）
 *            2. 自动切换模式域名表达式
 *            3. PAC 脚本常用函数
 * 长文案按界面语言渲染：表格内容放在组件内双语字典，
 * resolvedUiLocale 是响应式的，切换语言即时生效。
 */
import { computed } from 'vue';
import { NTable } from 'naive-ui';
import { resolvedUiLocale } from '@/utils/i18n';

interface DocCopy {
  bypassTitle: string;
  autoTitle: string;
  pacTitle: string;
  colExpr: string;
  colDesc: string;
  colFn: string;
  bypassRows: Array<[string, string]>;
  autoRows: Array<[string, string]>;
  pacFunctions: Array<[string, string]>;
  autoNote: string;
  officialDoc: string;
}

const COPY: Record<'zh_CN' | 'en', DocCopy> = {
  zh_CN: {
    bypassTitle: 'bypassList 主机通配符（固定服务器模式）',
    autoTitle: '自动切换模式域名表达式',
    pacTitle: 'PAC 脚本常用函数',
    colExpr: '表达式',
    colDesc: '说明',
    colFn: '函数 / 返回值',
    bypassRows: [
      ['127.0.0.1', 'http://127.0.0.1 的访问不会走代理'],
      ['localhost', 'http://localhost 的访问不会走代理'],
      ['::1', 'http://[::1] 的访问不会走代理（IPv6 本地回环地址）'],
      ['192.168.1.0/24', '对主机范围 192.168.1.0 ~ 192.168.1.255 的访问不会走代理'],
      ['qq.com', '仅 http://qq.com 不走代理，其它子域名（如 http://www.qq.com）会走代理'],
      ['.qq.com', 'qq.com 及其所有子域名都不走代理'],
      ['*.qq.com', 'qq.com 域名下所有子域名不走代理（推荐写法）'],
      ['*qq.com', 'http://abc.qq.com 或 http://abcqq.com 的访问不会走代理'],
      ['login.qq.com', '仅 http://login.qq.com 这一个主机不走代理'],
      ['<-loopback>', '反转语义：让 localhost / 127.0.0.1 的流量也走代理（本地应用抓包常用）'],
    ],
    autoRows: [
      ['example.com', '仅精确匹配 example.com'],
      ['*.example.com', '匹配 example.com 及其全部子域名（推荐）'],
      ['.example.com', '同 *.example.com'],
      ['*qq.com', '匹配 abc.qq.com、abcqq.com 等包含该片段的域名'],
      ['*', '匹配所有域名'],
    ],
    pacFunctions: [
      ['shExpMatch(host, pattern)', 'Shell 风格通配符匹配，* 匹配任意字符、? 匹配单个字符'],
      ['dnsDomainIs(host, domain)', '判断 host 是否属于某域名及其子域名'],
      ['isInNet(host, ip, mask)', '判断解析后的 IP 是否在指定网段，如 isInNet(host, "10.0.0.0", "255.0.0.0")'],
      ['myIpAddress()', '返回本机 IP'],
      ['PROXY host:port / SOCKS5 host:port / DIRECT', '返回值：HTTP(S) 代理 / SOCKS5 代理 / 直连'],
    ],
    autoNote: '规则按列表顺序匹配，先命中先生效；未命中时走"默认走向"设置。',
    officialDoc: '官方文档：',
  },
  en: {
    bypassTitle: 'bypassList host wildcards (Fixed Servers mode)',
    autoTitle: 'Auto Switch domain patterns',
    pacTitle: 'Common PAC script functions',
    colExpr: 'Expression',
    colDesc: 'Description',
    colFn: 'Function / Return value',
    bypassRows: [
      ['127.0.0.1', 'Requests to http://127.0.0.1 bypass the proxy'],
      ['localhost', 'Requests to http://localhost bypass the proxy'],
      ['::1', 'Requests to http://[::1] bypass the proxy (IPv6 loopback)'],
      ['192.168.1.0/24', 'Hosts in 192.168.1.0 ~ 192.168.1.255 bypass the proxy'],
      ['qq.com', 'Only http://qq.com bypasses; subdomains (e.g. http://www.qq.com) still use the proxy'],
      ['.qq.com', 'qq.com and all its subdomains bypass the proxy'],
      ['*.qq.com', 'All subdomains of qq.com bypass the proxy (recommended)'],
      ['*qq.com', 'Requests to http://abc.qq.com or http://abcqq.com bypass the proxy'],
      ['login.qq.com', 'Only the single host http://login.qq.com bypasses'],
      ['<-loopback>', 'Inverted semantics: force localhost / 127.0.0.1 traffic through the proxy (common for local app interception)'],
    ],
    autoRows: [
      ['example.com', 'Exact match of example.com only'],
      ['*.example.com', 'example.com and all its subdomains (recommended)'],
      ['.example.com', 'Same as *.example.com'],
      ['*qq.com', 'Domains containing the fragment, e.g. abc.qq.com, abcqq.com'],
      ['*', 'All domains'],
    ],
    pacFunctions: [
      ['shExpMatch(host, pattern)', 'Shell-style wildcard match; * matches any chars, ? matches one char'],
      ['dnsDomainIs(host, domain)', 'Whether host belongs to a domain and its subdomains'],
      ['isInNet(host, ip, mask)', 'Whether the resolved IP is in a subnet, e.g. isInNet(host, "10.0.0.0", "255.0.0.0")'],
      ['myIpAddress()', 'Returns the local IP'],
      ['PROXY host:port / SOCKS5 host:port / DIRECT', 'Return value: HTTP(S) proxy / SOCKS5 proxy / direct'],
    ],
    autoNote: 'Rules are matched in list order, first match wins; unmatched traffic uses the "default target" setting.',
    officialDoc: 'Official docs: ',
  },
};

const copy = computed(() => COPY[resolvedUiLocale()]);
</script>

<template>
  <div class="doc">
    <h3>{{ copy.bypassTitle }}</h3>
    <n-table :bordered="false" :single-line="false" size="small">
      <thead>
        <tr>
          <th style="width: 200px">{{ copy.colExpr }}</th>
          <th>{{ copy.colDesc }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="([expr, desc], i) in copy.bypassRows" :key="`b${i}`">
          <td><code>{{ expr }}</code></td>
          <td>{{ desc }}</td>
        </tr>
      </tbody>
    </n-table>

    <h3>{{ copy.autoTitle }}</h3>
    <n-table :bordered="false" :single-line="false" size="small">
      <thead>
        <tr>
          <th style="width: 200px">{{ copy.colExpr }}</th>
          <th>{{ copy.colDesc }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="([expr, desc], i) in copy.autoRows" :key="`a${i}`">
          <td><code>{{ expr }}</code></td>
          <td>{{ desc }}</td>
        </tr>
      </tbody>
    </n-table>
    <p class="note">{{ copy.autoNote }}</p>

    <h3>{{ copy.pacTitle }}</h3>
    <n-table :bordered="false" :single-line="false" size="small">
      <thead>
        <tr>
          <th style="width: 320px">{{ copy.colFn }}</th>
          <th>{{ copy.colDesc }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="([expr, desc], i) in copy.pacFunctions" :key="`p${i}`">
          <td><code>{{ expr }}</code></td>
          <td>{{ desc }}</td>
        </tr>
      </tbody>
    </n-table>

    <p class="note">
      {{ copy.officialDoc }}
      <a
        href="https://developer.chrome.com/docs/extensions/reference/api/proxy#bypass_list"
        target="_blank"
      >chrome.proxy bypass_list</a>
    </p>
  </div>
</template>

<style scoped>
.doc h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 18px 0 10px;
}

.doc h3:first-child {
  margin-top: 0;
}

code {
  font-family: Consolas, monospace;
  background: rgba(0, 95, 184, 0.07);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.note {
  font-size: 13px;
  color: #616161;
  margin-top: 10px;
}

.note a {
  color: #005fb8;
}
</style>
