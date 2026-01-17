import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Achievement } from '../types';
import { getStoredUser } from '../services/authService';
import { MinecraftButton } from './MinecraftButton';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import * as Icons from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';

interface Props {
  achievement: Achievement;
  onClose: () => void;
  achievedAt?: number; // timestamp
}

// A simple social-card generator using canvas
export const ShareModal: React.FC<Props> = ({ achievement, onClose, achievedAt }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const user = getStoredUser();

  // Portrait image (Instagram Story)
  const width = 1080;
  const height = 1920;

  const draw = async () => {
    setIsGenerating(true);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure the app's pixel font (VT323) is loaded so canvas text matches in-app typography
    try {
      if ((document as any).fonts && (document as any).fonts.load) {
        // load font weights/sizes we will use
        await Promise.all([
          (document as any).fonts.load('24px "VT323"'),
          (document as any).fonts.load('72px "VT323"'),
          (document as any).fonts.load('28px "VT323"'),
          (document as any).fonts.load('16px "VT323"')
        ]);
      }
    } catch (e) {
      // If fonts API isn't available or load fails, continue with fallback fonts
    }

    // 1. Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    // pick two pleasant colors derived from category title hash
    const baseA = '#4f46e5';
    const baseB = '#06b6d4';
    grad.addColorStop(0, baseA);
    grad.addColorStop(1, baseB);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Decorative noise/diagonal rays
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 30; i++) {
      ctx.fillRect(i * 60, 0, 30, height);
    }
    ctx.globalAlpha = 1;

    // 3. Draw a soft vignette
    const vignette = ctx.createRadialGradient(width/2, height/2, Math.min(width,height)/4, width/2, height/2, Math.max(width,height)/1.2);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 4. Draw Achievement Frame (matching AchievementIcon style)
    // Determine colors from category
    const categoryColor = (CATEGORY_COLORS as any)[achievement.category] || '#7E7E7E';
    const currentStyle = getCategoryStyles(categoryColor);

    const frameWidth = Math.round(width * 0.72);
    const frameHeight = Math.round(width * 0.72); // square-ish frame for icon
    const frameX = Math.round((width - frameWidth) / 2);
    const frameY = 140;

    // draw drop shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(ctx, frameX + 8, frameY + 8, frameWidth, frameHeight, 28);
    ctx.fill();
    ctx.restore();

    // draw main frame
    ctx.save();
    // fill
    ctx.fillStyle = currentStyle.bg;
    roundRect(ctx, frameX, frameY, frameWidth, frameHeight, 28);
    ctx.fill();
    // border accents - top/left lighter, bottom/right darker
    ctx.lineWidth = 10;
    // top/left highlight
    ctx.strokeStyle = currentStyle.light;
    // draw top-left highlight as a stroked rounded rect clipped to top-left
    ctx.beginPath();
    roundRect(ctx, frameX, frameY, frameWidth, frameHeight, 28);
    ctx.closePath();
    // use composite to simulate multi-colored border by drawing entire stroke with light then overdraw with dark using clipping
    ctx.stroke();
    // bottom/right shadow
    // simulate by drawing again with darker color but offset masked
    ctx.strokeStyle = currentStyle.dark;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    // inner decorative inset
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    roundRect(ctx, frameX + 12, frameY + 12, frameWidth - 24, frameHeight - 24, 20);
    ctx.fill();
    ctx.restore();

    // draw inner circle for icon area (centered within frame)
    const iconSize = Math.round(frameWidth * 0.55);
    const iconCenterX = width/2;
    const iconCenterY = frameY + Math.round(frameHeight/2);
    ctx.beginPath();
    ctx.arc(iconCenterX, iconCenterY, Math.round(iconSize/2) + 6, 0, Math.PI*2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fill();

    // Render Lucide icon by mounting the icon offscreen and serializing its inline SVG
    try {
      const iconUrl = await renderLucideIconToDataUrl(achievement.iconName, Math.round(iconSize * 0.75), '#FFFFFF');
      // draw the icon centered
      const iconDrawSize = Math.round(iconSize * 0.75);
      await drawImageFromUrl(ctx, iconUrl, iconCenterX - iconDrawSize/2, iconCenterY - iconDrawSize/2, iconDrawSize, iconDrawSize);
      // No revoke for data URL
    } catch (e) {
      // fallback: draw the icon name text if serialization fails
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(achievement.iconName, iconCenterX, iconCenterY + 12);
    }

    // 5. Title and text
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';

    const username = user?.username || 'Someone';
    const dateStr = achievedAt ? new Date(achievedAt).toLocaleDateString() : new Date().toLocaleDateString();
    const line1 = `${username} got the achievement`;
    const titleLine = achievement.title;
    const dateLine = `on ${dateStr}`;

    // Draw user avatar above the username (circular)
    const gap = Math.round(width * 0.04); // consistent vertical rhythm
    const avatarSize = Math.round(width * 0.08); // scale with width
    const avatarX = Math.round(width/2 - avatarSize/2);
    let currentY = frameY + frameHeight + gap;
    const avatarY = currentY;
    if (user?.avatarUrl) {
      try {
        await drawCircularImageFromUrl(ctx, user.avatarUrl, avatarX, avatarY, avatarSize);
      } catch {
        // draw placeholder circle
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath(); ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI*2); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    } else {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath(); ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI*2); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    // New approach: draw a single centered textbox containing three parts:
    // username (smaller), wrapped title (large, may be multiple lines), and date (smaller)
    const boxMaxWidth = Math.round(width * 0.82);
    const usernameFont = '28px "VT323", monospace';
    const titleFont = '72px "VT323", monospace';
    const dateFont = '30px "VT323", monospace';

    // move down to leave space after avatar
    currentY += avatarSize + Math.round(gap/2);

    // prepare wrapped title lines
    const titleLines = wrapTextLines(ctx, titleLine, boxMaxWidth, titleFont);

    // measure heights
    const usernameHeight = getFontSizeFromFont(usernameFont) * 1.05;
    const titleLineHeight = getFontSizeFromFont(titleFont) * 1.05;
    const dateHeight = getFontSizeFromFont(dateFont) * 1.05;

    const verticalPadding = Math.round(gap / 1.2);
    const interLineGap = Math.round(gap / 2);

    const totalTextHeight = usernameHeight + interLineGap + (titleLines.length * titleLineHeight) + interLineGap + dateHeight;

    // box top-left
    const boxX = Math.round((width - boxMaxWidth) / 2);
    const boxY = Math.round(currentY - verticalPadding);
    const boxH = Math.round(totalTextHeight + verticalPadding * 2);

    // draw semi-transparent rounded box behind text for contrast
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    roundRect(ctx, boxX, boxY, boxMaxWidth, boxH, 12);
    ctx.fill();
    ctx.restore();

    // draw username
    let textY = boxY + verticalPadding + usernameHeight / 2;
    drawTextWithStroke(ctx, line1, width/2, textY, usernameFont, '#fff', 'rgba(0,0,0,0.6)');

    // draw title lines
    textY += usernameHeight / 2 + interLineGap + titleLineHeight / 2;
    for (const l of titleLines) {
      drawTextWithStroke(ctx, l, width/2, textY, titleFont, '#fff', 'rgba(0,0,0,0.65)');
      textY += titleLineHeight;
    }

    // draw date
    textY += interLineGap - titleLineHeight / 2;
    drawTextWithStroke(ctx, dateLine, width/2, textY, dateFont, '#fff', 'rgba(0,0,0,0.55)');

    // 6. small footer
    ctx.font = '16px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Shared from NUS Digital Achievements', width/2, height - 28);

    const final = canvas.toDataURL('image/png');
    setDataUrl(final);
    setIsGenerating(false);
  };

  useEffect(() => {
    draw().catch(() => setIsGenerating(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${achievement.id}-achievement.png`;
    a.click();
  };

  const handleShare = async () => {
    if (!dataUrl) return;
    // Try Web Share API for files
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const filesArray = [new File([blob], `${achievement.id}.png`, { type: blob.type })];
      if ((navigator as any).canShare && (navigator as any).canShare({ files: filesArray })) {
        await (navigator as any).share({ files: filesArray, title: achievement.title, text: `I earned ${achievement.title}!` });
        return;
      }
    } catch (e) {
      // fall through to fallback
    }

    // Fallback: open image in new tab so mobile users can long-press to share
    const w = window.open();
    if (w) {
      w.document.write(`<img src="${dataUrl}" style="max-width:100%"/>`);
    }
  };

  const content = (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 p-4" style={{ zIndex: 2147483647 }}>
      <div className="relative w-full max-w-3xl bg-neutral-900 border-2 rounded-lg overflow-hidden p-0 max-h-[90vh] flex flex-col">
         <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-bold text-white">Share Achievement</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1 ml-2"><X /></button>
         </div>

         <div className="flex-1 overflow-auto p-4">
           <div className="flex flex-col md:flex-row gap-4">
             <div className="flex-1 flex items-center justify-center bg-black/30 p-2 rounded overflow-hidden">
               {isGenerating ? (
                  <div className="text-gray-300">Generating preview...</div>
               ) : dataUrl ? (
                  <img src={dataUrl} alt="Share preview" className="w-full h-auto max-h-[70vh] object-contain rounded shadow-lg" />
               ) : (
                  <div className="text-gray-400">No preview</div>
               )}
             </div>

             <div className="w-full md:w-60 flex flex-col gap-3">
               <MinecraftButton onClick={handleDownload} variant="green">Download Image</MinecraftButton>
               <button onClick={() => { if (dataUrl) window.open(dataUrl, '_blank'); }} className="bg-gray-700 text-white px-3 py-2 rounded">Open Full Size</button>
               <MinecraftButton onClick={handleShare} variant="green">Share to App...</MinecraftButton>
               <button onClick={() => { if (dataUrl) navigator.clipboard?.writeText(dataUrl); }} className="bg-gray-700 text-white px-3 py-2 rounded">Copy Image URL</button>
               <button onClick={onClose} className="bg-gray-800 text-gray-300 px-3 py-2 rounded">Close</button>
             </div>
           </div>
         </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// Helpers
function drawCircularImageFromUrl(ctx: CanvasRenderingContext2D, url: string, x: number, y: number, size: number) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
      resolve();
    };
    img.onerror = () => resolve();
    img.src = url;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

function drawImageFromUrl(ctx: CanvasRenderingContext2D, url: string, x: number, y: number, w: number, h: number) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { ctx.drawImage(img, x, y, w, h); resolve(); };
    img.onerror = () => resolve();
    img.src = url;
  });
}

async function renderLucideIconToDataUrl(iconName: string, size: number, color: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      const IconComp = (Icons as any)[iconName] || (Icons as any).HelpCircle;
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = `${size}px`;
      container.style.height = `${size}px`;
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(
        React.createElement('div', { style: { width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
          React.createElement(IconComp, { size, color, strokeWidth: 3 })
        )
      );

      // Wait a few frames for the icon to render (some browsers may delay SVG injection)
      const tryFindSvg = () => {
        for (let i = 0; i < 6; i++) {
          // yield control to the browser
          // eslint-disable-next-line no-await-in-loop
        }
      };

      (async () => {
        let svg: Element | null = null;
        const maxAttempts = 20;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          // wait ~30ms between attempts to give the browser time to paint
          // eslint-disable-next-line no-await-in-loop
          await new Promise((res) => setTimeout(res, 30));
          svg = container.querySelector('svg');
          if (svg) break;
        }

        if (!svg) {
          reject(new Error('SVG not found'));
          root.unmount();
          document.body.removeChild(container);
          return;
        }

        const xml = new XMLSerializer().serializeToString(svg);
        const b64 = window.btoa(unescape(encodeURIComponent(xml)));
        const dataUrl = `data:image/svg+xml;base64,${b64}`;
        resolve(dataUrl);
      })();
    } catch (e) {
      reject(e);
    }
  });
}

function getCategoryStyles(baseColor: string) {
  return {
    bg: baseColor,
    light: adjustColor(baseColor, 40),
    dark: adjustColor(baseColor, -40)
  };
}

// Helper to lighten/darken hex color
function adjustColor(color: string, amount: number) {
  return '#' + color.replace(/^#/, '').replace(/../g, (c) => ('0'+Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).substr(-2));
}

function drawWrappedTextWithStroke(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, font: string, fill: string, stroke: string, lineHeightMultiplier = 1.2) {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = Math.max(2, Math.floor(parseInt(font.match(/(\d+)px/)?.[1] || '32') / 14));

  const words = String(text).split(' ');
  const lines: string[] = [];
  let current = '';
  for (let i = 0; i < words.length; i++) {
    const test = current ? `${current} ${words[i]}` : words[i];
    const w = ctx.measureText(test).width;
    if (w > maxWidth && current) {
      lines.push(current);
      current = words[i];
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  const fontSize = parseInt((font.match(/(\d+)px/) || [])[1] || '32');
  const lineHeight = fontSize * (lineHeightMultiplier || 1.1);

  for (let i = 0; i < lines.length; i++) {
    const yy = y + i * lineHeight;
    ctx.strokeText(lines[i], x, yy);
    ctx.fillText(lines[i], x, yy);
  }
  ctx.restore();
  return lines.length * lineHeight;
}

function drawTextWithStroke(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, fillStyle: string, strokeStyle: string) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = Math.max(2, Math.floor(parseInt(font.match(/(\d+)px/)?.[1] || '24') / 8));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
  ctx.restore();
}

function getFontSizeFromFont(font: string) {
  const m = font.match(/(\d+)px/);
  return m ? parseInt(m[1], 10) : 16;
}

function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string) {
  ctx.save();
  ctx.font = font;
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (let i = 0; i < words.length; i++) {
    const test = current ? `${current} ${words[i]}` : words[i];
    const w = ctx.measureText(test).width;
    if (w > maxWidth && current) {
      lines.push(current);
      current = words[i];
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  ctx.restore();
  return lines;
}
