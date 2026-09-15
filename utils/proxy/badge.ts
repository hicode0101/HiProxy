/**
 * 工具栏图标与徽标
 * 用 OffscreenCanvas 动态画一个圆环（外圈为配置颜色，内圈挖空），
 * 再叠加模式徽标文字（固定服务器模式显示配置名前 4 字符）。
 */
import { browser } from '#imports';
import { t } from '@/utils/i18n';
import type { ResolvedTarget } from '@/utils/proxy/engine';
import type { ExtensionConfig } from '@/types';

/** 画圆环图标并返回像素数据 */
function drawRingIcon(color: string, size = 32): ImageData {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas 2d context unavailable');

  const c = size / 2;
  // 外圈实心圆
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(c, c, c - 1, 0, Math.PI * 2);
  ctx.fill();
  // 内圈挖空成圆环
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(c, c, (c - 1) * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  return ctx.getImageData(0, 0, size, size);
}

/** 根据当前生效目标刷新图标、徽标与 tooltip */
export async function updateBadge(_cfg: ExtensionConfig, target: ResolvedTarget): Promise<void> {
  try {
    await browser.action.setIcon({ imageData: drawRingIcon(target.badgeColor) });

    if (_cfg.showBadge && target.badgeText) {
      await browser.action.setBadgeText({ text: target.badgeText });
      await browser.action.setBadgeBackgroundColor({ color: target.badgeColor });
      // setBadgeTextColor 需要 Chrome 110+，低版本静默忽略
      if (typeof browser.action.setBadgeTextColor === 'function') {
        await browser.action.setBadgeTextColor({ color: '#ffffff' });
      }
    } else {
      await browser.action.setBadgeText({ text: '' });
    }

    await browser.action.setTitle({ title: `HiProxy · ${t(target.labelKey)}` });
  } catch (err) {
    console.error('[HiProxy] update badge failed:', err);
  }
}
