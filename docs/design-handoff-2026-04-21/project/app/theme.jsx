// Theme system: Light / Dark / Combat (red night mode)
// Primary variants: sage, teal, slate
// Density variants: compact, comfortable, spacious
// Card styles: flat, shadow, outlined

const PRIMARY_PALETTES = {
  // forest — ירוק הרים עמוק (נשאב ישירות מהלוגו)
  forest:{ 100:'#d4e5d8', 300:'#6fa079', 400:'#4f8659', 500:'#3c6e45', 600:'#2F6B45', 700:'#224d32', 800:'#173724', 900:'#0e2217' },
  // olive — ירוק-זית חם יותר
  olive: { 100:'#dde2cc', 300:'#9aaa7a', 400:'#77895a', 500:'#5f7048', 600:'#4F6B3E', 700:'#3a4e2d', 800:'#2a391f', 900:'#1b2413' },
  sage:  { 100:'#d9e5e2', 300:'#8db1a8', 400:'#7C9A92', 500:'#6a857e', 600:'#586e68', 700:'#465752', 800:'#34403d', 900:'#222a28' },
  teal:  { 100:'#cfe6e4', 300:'#74b5ae', 400:'#4E9E95', 500:'#3d857c', 600:'#2f6b63', 700:'#25544e', 800:'#1c403c', 900:'#132b28' },
  slate: { 100:'#dbe1ea', 300:'#92a3b8', 400:'#6e829c', 500:'#566b85', 600:'#44566d', 700:'#344253', 800:'#27323f', 900:'#1a222c' },
};

const STATUS = {
  success: '#19BE65',
  warning: '#FDA828',
  error:   '#F92457',
  rose:    '#E9A6A6',
  sky:     '#A0C4FF',
};

const DENSITY = {
  compact:     { gap: 8,  pad: 12, cardPad: 14, row: 52, font: 14 },
  comfortable: { gap: 12, pad: 16, cardPad: 18, row: 60, font: 15 },
  spacious:    { gap: 16, pad: 20, cardPad: 22, row: 68, font: 16 },
};

function buildTheme({ mode, primary, density, card }) {
  const pal = PRIMARY_PALETTES[primary] || PRIMARY_PALETTES.sage;
  const den = DENSITY[density] || DENSITY.comfortable;

  // base colors
  let t;
  if (mode === 'combat') {
    // Red night-vision mode. Black base; red as the only chromatic accent.
    t = {
      bg:        '#0a0000',
      bgCard:    '#140404',
      bgMuted:   '#1c0707',
      fg:        '#ff3838',          // primary red text
      fgMuted:   '#a62020',
      fgDim:     '#5e1515',
      border:    '#3a0a0a',
      borderStrong: '#5c1010',
      primary:   '#ff2a2a',
      primaryFg: '#0a0000',
      primarySoft: '#2a0606',
      primaryBorder: '#7a1414',
      success:   '#ff6666',  // everything red
      warning:   '#ff8c8c',
      error:     '#ff2020',
      rose:      '#ff5c5c',
      sky:       '#ff8080',
      chipBg:    '#1f0606',
      headerBg:  '#120303',
      navBg:     '#120303',
      navActiveBg: '#2a0707',
      shadow:    '0 0 0 rgba(0,0,0,0)',
      ring:      'rgba(255,40,40,0.35)',
      overlay:   'rgba(0,0,0,0.85)',
      scheme:    'dark',
    };
  } else if (mode === 'dark') {
    t = {
      bg:        '#0f1113',
      bgCard:    '#181b1f',
      bgMuted:   '#23272c',
      fg:        '#eef1f3',
      fgMuted:   '#98a0ab',
      fgDim:     '#5c656f',
      border:    '#2a2f35',
      borderStrong: '#3a4048',
      primary:   pal[400],
      primaryFg: '#0a0d0f',
      primarySoft: '#1e2826',
      primaryBorder: pal[700],
      success:   STATUS.success,
      warning:   STATUS.warning,
      error:     STATUS.error,
      rose:      STATUS.rose,
      sky:       STATUS.sky,
      chipBg:    '#23272c',
      headerBg:  '#13161a',
      navBg:     '#14171b',
      navActiveBg: pal[800],
      shadow:    '0 8px 24px rgba(0,0,0,0.35)',
      ring:      'rgba(140,177,168,0.25)',
      overlay:   'rgba(0,0,0,0.7)',
      scheme:    'dark',
    };
  } else {
    // light
    t = {
      bg:        '#F8F9FB',
      bgCard:    '#ffffff',
      bgMuted:   '#F0F4F8',
      fg:        '#16171A',
      fgMuted:   '#747A85',
      fgDim:     '#9FA7B7',
      border:    '#E4E9ED',
      borderStrong: '#D5D9DF',
      primary:   pal[500],
      primaryFg: '#ffffff',
      primarySoft: pal[100],
      primaryBorder: pal[300],
      success:   STATUS.success,
      warning:   STATUS.warning,
      error:     STATUS.error,
      rose:      STATUS.rose,
      sky:       STATUS.sky,
      chipBg:    '#F0F4F8',
      headerBg:  '#ffffff',
      navBg:     '#ffffff',
      navActiveBg: pal[100],
      shadow:    '0 4px 16px rgba(22,23,26,0.08)',
      ring:      'rgba(124,154,146,0.3)',
      overlay:   'rgba(22,23,26,0.5)',
      scheme:    'light',
    };
  }

  t.mode = mode;
  t.primaryPaletteKey = primary;
  t.palette = pal;
  t.density = den;
  t.densityKey = density;
  t.cardStyle = card; // flat | shadow | outlined
  return t;
}

// card shell style per cardStyle setting
function cardStyle(t, extra = {}) {
  const base = {
    background: t.bgCard,
    borderRadius: 14,
    padding: t.density.cardPad,
  };
  if (t.cardStyle === 'flat')    return { ...base, ...extra };
  if (t.cardStyle === 'outlined') return { ...base, border: `1px solid ${t.border}`, ...extra };
  if (t.cardStyle === 'outlined-shadow') return { ...base, border: `1px solid ${t.border}`, boxShadow: t.shadow, ...extra };
  // shadow (default)
  return { ...base, boxShadow: t.shadow, border: `1px solid ${t.mode === 'light' ? 'rgba(0,0,0,0.03)' : 'transparent'}`, ...extra };
}

const ThemeCtx = React.createContext(null);
const useTheme = () => React.useContext(ThemeCtx);

window.buildTheme = buildTheme;
window.cardStyle = cardStyle;
window.ThemeCtx = ThemeCtx;
window.useTheme = useTheme;
window.PRIMARY_PALETTES = PRIMARY_PALETTES;
