// Colores del sitio por modo (fondo, tarjetas, texto, texto secundario) + color de acento, con validación WCAG.
// Todo vive en un solo campo para que el contraste se mida contra los colores reales que se van a publicar.
// No permite guardar si alguna combinación queda por debajo de AA (4.5:1) y muestra si llega a AAA (7:1).
import type { BasicFormField } from '@keystatic/core';
import { ColorStyles, Head, Swatch } from './color-ui';

export type Theme = { bg: string; surface: string; ink: string; muted: string };
export type Accent = { light: string; lightInk: string; dark: string; darkInk: string; site: { light: Theme; dark: Theme } };

// colores base originales (ver src/styles/global.css)
export const SITE_DEFAULT: Accent['site'] = {
  light: { bg: '#eceef1', surface: '#e1e4e9', ink: '#1f2328', muted: '#444a53' },
  dark: { bg: '#121418', surface: '#1b1e24', ink: '#eceef2', muted: '#aeb3bd' },
};
const AA = 4.5;
const AAA = 7;

const HEX = /^#[0-9a-fA-F]{6}$/;
const lum = (hex: string) => {
  const c = hex.slice(1).match(/../g)!.map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const ACCENT_KEYS = { light: ['light', 'lightInk'], dark: ['dark', 'darkInk'] } as const;
const NAMES = { light: 'modo claro', dark: 'modo oscuro' } as const;

/** Todas las combinaciones de texto que el sitio usa en un modo. */
export function themeChecks(v: Accent, mode: 'light' | 'dark') {
  const t = v.site[mode], accent = v[ACCENT_KEYS[mode][0]], accentInk = v[ACCENT_KEYS[mode][1]];
  return [
    { label: 'Texto principal sobre el fondo', fg: t.ink, bg: t.bg },
    { label: 'Texto secundario sobre el fondo', fg: t.muted, bg: t.bg },
    { label: 'Texto principal sobre tarjetas', fg: t.ink, bg: t.surface },
    { label: 'Texto secundario sobre tarjetas', fg: t.muted, bg: t.surface },
    { label: 'Texto del botón sobre el acento', fg: accentInk, bg: accent },
    { label: 'Enlaces (acento) sobre el fondo', fg: accent, bg: t.bg },
    { label: 'Acento sobre tarjetas', fg: accent, bg: t.surface },
  ];
}
export const accentChecks = (v: Accent) => [...themeChecks(v, 'light'), ...themeChecks(v, 'dark')];

export function validateAccent(v: Accent) {
  for (const k of ['light', 'lightInk', 'dark', 'darkInk'] as const) {
    if (!HEX.test(v[k] ?? '')) throw new Error(`"${k}" debe ser un color hex de 6 dígitos, por ejemplo #5a3ec8.`);
  }
  for (const m of ['light', 'dark'] as const) {
    for (const k of ['bg', 'surface', 'ink', 'muted'] as const) {
      if (!HEX.test(v.site?.[m]?.[k] ?? '')) throw new Error(`Colores del ${NAMES[m]}: deben ser hex de 6 dígitos, por ejemplo #eceef1.`);
    }
    for (const c of themeChecks(v, m)) {
      const r = contrast(c.fg, c.bg);
      if (r < AA) throw new Error(`${c.label} (${NAMES[m]}): ${r.toFixed(2)}:1 no cumple AA (mínimo 4.5:1).`);
    }
  }
  return v;
}

const DEFAULT: Accent = { light: '#5a3ec8', lightInk: '#ffffff', dark: '#b9a4ff', darkInk: '#0d0e10', site: SITE_DEFAULT };

const MODES = {
  light: { name: 'Modo claro', icon: '☀', accent: 'light', accentInk: 'lightInk' },
  dark: { name: 'Modo oscuro', icon: '☾', accent: 'dark', accentInk: 'darkInk' },
} as const;

// barra de contraste: escala 1–12:1 con marcas en AA (4.5) y AAA (7)
const MAX_RATIO = 12;
const pct = (r: number) => `${Math.min(100, ((r - 1) / (MAX_RATIO - 1)) * 100)}%`;

function Check({ label, fg, bg }: { label: string; fg: string; bg: string }) {
  const valid = HEX.test(fg) && HEX.test(bg);
  const r = valid ? contrast(fg, bg) : 1;
  const tone = r >= AAA ? '#1f9d55' : r >= AA ? '#c58a09' : '#d33a3a';
  return (
    <li className="kc-check">
      <span className="kc-check__label">{label}</span>
      <span className="kc-check__ratio">
        {valid ? `${r.toFixed(2)}:1` : '—'}
        <span className={`kc-pill ${r >= AA ? 'kc-pill--ok' : 'kc-pill--no'}`}>AA</span>
        <span className={`kc-pill ${r >= AAA ? 'kc-pill--ok' : 'kc-pill--no'}`}>AAA</span>
      </span>
      <span className="kc-meter" aria-hidden="true">
        <span className="kc-meter__fill" style={{ width: pct(r), background: tone }} />
        <span className="kc-meter__mark" style={{ left: pct(AA) }} />
        <span className="kc-meter__mark" style={{ left: pct(AAA) }} />
      </span>
    </li>
  );
}

const safe = (c: string, fallback: string) => (HEX.test(c) ? c : fallback);

function ModeCard({ mode, value, set, setSite }: { mode: keyof typeof MODES; value: Accent; set: (k: keyof Accent) => (v: string) => void; setSite: (m: 'light' | 'dark', k: keyof Theme) => (v: string) => void }) {
  const m = MODES[mode];
  const d = SITE_DEFAULT[mode];
  const t = value.site[mode];
  const bg = safe(t.bg, d.bg), surface = safe(t.surface, d.surface), ink = safe(t.ink, d.ink), muted = safe(t.muted, d.muted);
  const accent = safe(value[m.accent], ink), accentInk = safe(value[m.accentInk], bg);
  return (
    <div className="kc-mode">
      <div className="kc-stage" style={{ background: bg, color: ink }}>
        <span className="kc-stage__tag" style={{ color: muted, opacity: 1 }}><span aria-hidden="true">{m.icon}</span>{m.name}</span>
        <p className="kc-stage__title">¿Diseñamos algo?</p>
        <p className="kc-stage__text" style={{ opacity: 1 }}>Texto principal con un <a style={{ color: accent }}>enlace</a> en el color de acento.</p>
        <p className="kc-stage__text" style={{ color: muted, opacity: 1, fontSize: 13 }}>Texto secundario · Oaxaca, México · 2025</p>
        <div style={{ background: surface, borderRadius: 14, padding: '14px 16px', display: 'grid', gap: 4 }}>
          <span style={{ font: '650 28px/1 ui-sans-serif, system-ui, sans-serif', letterSpacing: '-0.03em', color: accent }}>+25%</span>
          <span style={{ fontSize: 13 }}>de retención con flujos rediseñados</span>
          <span style={{ fontSize: 12, color: muted }}>Wiggot · 2023–24</span>
        </div>
        <div className="kc-stage__row">
          <span className="kc-btn" style={{ background: accent, color: accentInk }}>Escríbeme</span>
          <span className="kc-chip" style={{ background: surface, color: accent }}>Caso de estudio</span>
        </div>
      </div>
      <div className="kc-controls">
        <span className="kc-swatch" style={{ marginBottom: -6 }}>Base del sitio</span>
        <div className="kc-pair">
          <Swatch label="Fondo" value={t.bg} onChange={setSite(mode, 'bg')} />
          <Swatch label="Tarjetas" value={t.surface} onChange={setSite(mode, 'surface')} />
          <Swatch label="Texto principal" value={t.ink} onChange={setSite(mode, 'ink')} />
          <Swatch label="Texto secundario" value={t.muted} onChange={setSite(mode, 'muted')} />
        </div>
        <span className="kc-swatch" style={{ marginBottom: -6 }}>Acento</span>
        <div className="kc-pair">
          <Swatch label="Acento" value={value[m.accent]} onChange={set(m.accent)} />
          <Swatch label="Texto sobre acento" value={value[m.accentInk]} onChange={set(m.accentInk)} />
        </div>
        <ul className="kc-checks">
          {themeChecks(value, mode).map((c) => <Check key={c.label} label={c.label} fg={c.fg} bg={c.bg} />)}
        </ul>
      </div>
    </div>
  );
}

export function accentField({ label }: { label: string }): BasicFormField<Accent> {
  return {
    kind: 'form',
    label,
    defaultValue: () => DEFAULT,
    parse: (raw) => {
      const v = (raw ?? {}) as Partial<Accent>;
      return {
        light: v.light ?? DEFAULT.light, lightInk: v.lightInk ?? DEFAULT.lightInk, dark: v.dark ?? DEFAULT.dark, darkInk: v.darkInk ?? DEFAULT.darkInk,
        site: { light: { ...SITE_DEFAULT.light, ...v.site?.light }, dark: { ...SITE_DEFAULT.dark, ...v.site?.dark } },
      };
    },
    serialize: (value) => ({ value }),
    validate: (value) => validateAccent(value),
    reader: {
      parse: (raw) => {
        const v = raw as Accent;
        return validateAccent({ ...v, site: { light: { ...SITE_DEFAULT.light, ...v.site?.light }, dark: { ...SITE_DEFAULT.dark, ...v.site?.dark } } });
      },
    },
    Input({ value, onChange, forceValidation }) {
      const set = (k: keyof Accent) => (v: string) => onChange({ ...value, [k]: v });
      const setSite = (m: 'light' | 'dark', k: keyof Theme) => (v: string) => onChange({ ...value, site: { ...value.site, [m]: { ...value.site[m], [k]: v } } });
      const allHex = (['light', 'lightInk', 'dark', 'darkInk'] as const).every((k) => HEX.test(value[k]))
        && (['light', 'dark'] as const).every((m) => (['bg', 'surface', 'ink', 'muted'] as const).every((k) => HEX.test(value.site[m][k])));
      let error = '';
      try { validateAccent(value); } catch (e) { error = (e as Error).message; }
      const aaa = !error && accentChecks(value).every((c) => contrast(c.fg, c.bg) >= AAA);
      const status = error
        ? <span className="kc-status kc-status--bad">✕ No cumple AA</span>
        : <span className="kc-status kc-status--ok">✓ {aaa ? 'Cumple AAA' : 'Cumple AA'}</span>;
      return (
        <div className="kc">
          <ColorStyles />
          <Head title={label} sub="Fondo, tarjetas, textos y acento de cada modo. La vista previa usa tus colores y cada combinación de texto debe cumplir WCAG AA (4.5:1) para poder guardar." status={status} />
          <div className="kc-modes">
            <ModeCard mode="light" value={value} set={set} setSite={setSite} />
            <ModeCard mode="dark" value={value} set={set} setSite={setSite} />
          </div>
          {error && (forceValidation || allHex) && <p role="alert" className="kc-error">No se puede guardar: {error}</p>}
          <button type="button" onClick={() => onChange(DEFAULT)} style={{ justifySelf: 'start', border: 0, background: 'none', padding: 0, color: 'inherit', opacity: 0.72, font: '500 13px ui-sans-serif, system-ui, sans-serif', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>
            Restaurar los colores originales
          </button>
        </div>
      );
    },
  };
}
