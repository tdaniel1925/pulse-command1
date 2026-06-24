// Halo shared theme engine — one token system for every page.
// Sets CSS custom properties on a root element from design props.
(function () {
  const THEMES = {
    Sunset:   { bg:'#FBF6EF', surface:'#FFFFFF', surface2:'#F4EADC', fg:'#2A2018', muted:'#8A7B6B', accent:'#E0603A', accent2:'#D89A3F', border:'#EADFD2', shadow:'0 14px 38px rgba(90,55,30,.10)' },
    Bold:     { bg:'#FFFFFF', surface:'#FFF8F0', surface2:'#FFEEDC', fg:'#17120D', muted:'#6B6157', accent:'#FF4D17', accent2:'#FFB627', border:'#17120D', shadow:'6px 6px 0 #17120D' },
    Midnight: { bg:'#15110C', surface:'#1F1811', surface2:'#271F16', fg:'#F6EEE2', muted:'#A6927C', accent:'#FF7A3D', accent2:'#FFC24B', border:'#352A1F', shadow:'0 24px 60px rgba(0,0,0,.55)' }
  };

  function readable(hex) {
    try {
      let h = String(hex).replace('#', '');
      if (h.length === 3) h = h.split('').map(c => c + c).join('');
      const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
      const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return L > 0.62 ? '#17120D' : '#FFFFFF';
    } catch (e) { return '#FFFFFF'; }
  }

  function tokens(p) {
    p = p || {};
    const base = THEMES[p.theme] || THEMES.Sunset;
    const accent = p.accent || base.accent;
    const accentFg = readable(accent);
    const r = Number(p.radius != null ? p.radius : 16);
    const padScale = ({ Compact: 0.78, Cozy: 1, Spacious: 1.3 })[p.density] || 1;
    const fonts = ({ Geometric: ['Sora', 'Manrope'], Grotesque: ['Space Grotesk', 'Manrope'], Rounded: ['Outfit', 'Manrope'] })[p.fontPair] || ['Sora', 'Manrope'];
    const borderW = p.theme === 'Bold' ? '2px' : '1px';

    let btn = { bg: accent, fg: accentFg, border: 'transparent', shadow: 'none', radius: Math.max(2, r - 4) + 'px' };
    if (p.buttonStyle === 'Outline') btn = { bg: 'transparent', fg: accent, border: accent, shadow: 'none', radius: Math.max(2, r - 4) + 'px' };
    if (p.buttonStyle === 'Pill') btn = { bg: accent, fg: accentFg, border: 'transparent', shadow: 'none', radius: '999px' };
    if (p.buttonStyle === 'Hard') btn = { bg: accent, fg: accentFg, border: base.fg, shadow: '5px 5px 0 ' + base.fg, radius: '6px' };

    let img = { radius: r + 'px', shadow: base.shadow, border: 'none', filter: 'none' };
    if (p.imageTreatment === 'Clean') img = { radius: '2px', shadow: 'none', border: 'none', filter: 'none' };
    if (p.imageTreatment === 'Frame') img = { radius: r + 'px', shadow: '0 6px 18px rgba(0,0,0,.10)', border: borderW + ' solid ' + base.border, filter: 'none' };
    if (p.imageTreatment === 'Duotone') img = { radius: r + 'px', shadow: base.shadow, border: 'none', filter: 'sepia(.38) saturate(1.3) hue-rotate(-12deg) contrast(1.02)' };
    if (p.imageTreatment === 'Outline') img = { radius: Math.max(2, r - 6) + 'px', shadow: 'none', border: '2px solid ' + base.fg, filter: 'none' };

    return {
      '--bg': base.bg, '--surface': base.surface, '--surface-2': base.surface2,
      '--fg': base.fg, '--muted': base.muted,
      '--accent': accent, '--accent-fg': accentFg, '--accent-2': base.accent2,
      '--border': base.border, '--border-w': borderW, '--shadow': base.shadow,
      '--radius': r + 'px', '--radius-sm': Math.max(0, r - 6) + 'px', '--pad-scale': String(padScale),
      '--font-display': "'" + fonts[0] + "'", '--font-body': "'" + fonts[1] + "'",
      '--btn-bg': btn.bg, '--btn-fg': btn.fg, '--btn-border': btn.border, '--btn-shadow': btn.shadow, '--btn-radius': btn.radius,
      '--img-radius': img.radius, '--img-shadow': img.shadow, '--img-border': img.border, '--img-filter': img.filter
    };
  }

  function apply(el, p) {
    if (!el) return;
    const m = tokens(p);
    for (const k in m) el.style.setProperty(k, m[k]);
  }

  window.HaloTheme = { THEMES, tokens, apply, readable };
})();
