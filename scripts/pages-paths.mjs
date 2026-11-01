export function normalizeBasePath(value) {
  const base = value === '/' ? '' : value.replace(/\/$/, '');
  if (base && (!base.startsWith('/') || base.slice(1).split('/').some(part =>
    !part || part === '.' || part === '..' || !/^[A-Za-z0-9._-]+$/.test(part)))) {
    throw new Error('Base path inválido');
  }
  return base;
}

export function prefixUrl(url, base) {
  return url.startsWith('/') && !url.startsWith('//') ? base + url : url;
}

export function rewriteMarkup(source, base) {
  return source.replace(/\b(href|src|srcset|poster|data-poster-url|data-video-urls)\s*=\s*(["'])(.*?)\2/g,
    (_, name, quote, value) => {
      const rewritten = ['srcset', 'data-video-urls'].includes(name)
        ? value.replace(/(^|[\s,])(\/(?!\/)[^\s,]+)/g, (_match, space, url) => space + prefixUrl(url, base))
        : prefixUrl(value, base);
      return `${name}=${quote}${rewritten}${quote}`;
    });
}

export function rewriteCss(source, base) {
  return source.replace(/url\((['"]?)(\/(?!\/)[^)'"]+)\1\)/g,
    (_match, quote, url) => `url(${quote}${prefixUrl(url, base)}${quote})`);
}
