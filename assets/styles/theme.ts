/**
 * Win11 (Fluent Design) 主题定制
 * 取 Windows 11 系统强调色：常态 #005FB8 / 悬停 #0067C0 / 按下 #004578
 * 圆角、字体、控件密度都对齐 Win11 设置应用的观感
 */
import type { GlobalThemeOverrides } from 'naive-ui';

/** Win11 字体栈：Segoe UI Variable 优先，中文回退微软雅黑 */
export const WIN11_FONT =
  '"Segoe UI Variable Text", "Segoe UI", "Microsoft YaHei UI", "Microsoft YaHei", system-ui, -apple-system, sans-serif';

/** 等宽字体（PAC 脚本编辑器用） */
export const MONO_FONT =
  '"Cascadia Code", "Cascadia Mono", Consolas, "Courier New", monospace';

export const WIN11_ACCENT = '#005FB8';

export const win11Theme: GlobalThemeOverrides = {
  common: {
    primaryColor: WIN11_ACCENT,
    primaryColorHover: '#0067C0',
    primaryColorPressed: '#004578',
    primaryColorSuppl: '#0067C0',
    infoColor: '#0067C0',
    infoColorHover: '#1975C5',
    infoColorPressed: '#004578',
    borderRadius: '6px',
    borderRadiusSmall: '4px',
    fontFamily: WIN11_FONT,
    fontSize: '14px',
    fontWeightStrong: '600',
    textColor1: '#1b1b1b',
    textColor2: '#3b3b3b',
    dividerColor: 'rgba(0,0,0,0.08)',
  },
  Card: {
    borderRadius: '10px',
  },
  Tabs: {
    tabFontWeightActive: '600',
    tabGapMediumLine: '24px',
    panePaddingMediumTop: '18px',
  },
  Button: {
    borderRadiusMedium: '6px',
  },
  Dialog: {
    borderRadius: '10px',
  },
  Modal: {
    borderRadius: '10px',
  },
};
