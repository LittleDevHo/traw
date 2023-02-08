/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TLBounds } from '@tldraw/core';
import { TDExportType, TLDR } from '@tldraw/tldraw';

export const isChrome = () => {
  const isChromium = (window as any).chrome;
  const winNav = window.navigator;
  const vendorName = winNav.vendor;
  const isOpera = typeof (window as any).opr !== 'undefined';
  const isIEedge = winNav.userAgent.indexOf('Edg') > -1;
  const isIOSChrome = winNav.userAgent.match('CriOS');

  if (isIOSChrome) {
    return false;
  } else if (
    isChromium !== null &&
    typeof isChromium !== 'undefined' &&
    vendorName === 'Google Inc.' &&
    isOpera === false &&
    isIEedge === false
  ) {
    return true;
  } else {
    return false;
  }
};

export const getExpandedBounds = function (a: TLBounds, b: TLBounds): TLBounds {
  const minX = Math.min(a.minX, b.minX);
  const minY = Math.min(a.minY, b.minY);
  const maxX = Math.max(a.maxX, b.maxX);
  const maxY = Math.max(a.maxY, b.maxY);
  const width = Math.abs(maxX - minX);
  const height = Math.abs(maxY - minY);

  return { minX, minY, maxX, maxY, width, height };
};

export const getCommonBounds = function (bounds: TLBounds[]): TLBounds {
  if (bounds.length < 2) return bounds[0];

  let result = bounds[0];

  for (let i = 1; i < bounds.length; i++) {
    result = getExpandedBounds(result, bounds[i]);
  }

  return result;
};

export async function getImageForSvg(
  svg: SVGElement,
  type: Exclude<TDExportType, TDExportType.JSON> = TDExportType.PNG,
  opts = {} as Partial<{
    scale: number;
    quality: number;
    bound: TLBounds;
  }>,
) {
  const { scale = 2, quality = 1, bound } = opts;

  const childImages = Array.from(svg.querySelectorAll('image'));
  for (let i = 0; i < childImages.length; i++) {
    const child = childImages[i];
    const url = (child as SVGElement).getAttribute('xlink:href');
    if (url) {
      const resolvedUrl = await resolveImage(url);
      (child as SVGElement).setAttribute('xlink:href', resolvedUrl);
    }
  }

  const svgString = TLDR.getSvgString(svg, scale);

  const width = bound ? bound.width * scale : +svg.getAttribute('width')!;
  const height = bound ? bound.height * scale : +svg.getAttribute('height')!;

  if (!svgString) return;

  const canvas = await new Promise<HTMLCanvasElement>((resolve) => {
    const image = new Image();

    image.crossOrigin = 'anonymous';

    const base64SVG = window.btoa(unescape(encodeURIComponent(svgString)));

    const dataUrl = `data:image/svg+xml;base64,${base64SVG}`;

    image.onload = () => {
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      const context = canvas.getContext('2d')!;

      canvas.width = width;
      canvas.height = height;

      context.drawImage(
        image,
        bound ? bound.minX : 0,
        bound ? bound.minY : 0,
        width / scale,
        height / scale,
        0,
        0,
        width,
        height,
      );

      URL.revokeObjectURL(dataUrl);

      resolve(canvas);
    };

    image.onerror = (e) => {
      console.warn('Could not convert that SVG to an image.');
    };

    image.src = dataUrl;
  });

  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/' + type, quality));

  return blob;
}

const imageUrlToBase64 = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((onSuccess, onError) => {
    try {
      const reader = new FileReader();
      reader.onload = function () {
        onSuccess(this.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      onError(e);
    }
  });
};

async function resolveImage(url: string) {
  const response = await fetch(url, { mode: 'cors' });
  return await imageUrlToBase64(response.url);
}
