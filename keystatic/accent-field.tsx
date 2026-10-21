// Campo de color de acento con validación de contraste WCAG.
// No permite guardar si alguna combinación queda por debajo de AA (4.5:1) y muestra si llega a AAA (7:1).
import type { BasicFormField } from '@keystatic/core';

export type Accent = { light: string; lightInk: string; dark: string; darkInk: string };

// Fondos reales del sitio (ver src/styles/global.css)
const BG_LIGHT = '#eceef1';
const BG_DARK = '#121418';
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

/** Todas las combinaciones que el sitio usa con el acento. */
export function accentChecks(v: Accent) {
  return [
    { label: 'Botón claro: texto sobre acento', fg: v.lightInk, bg: v.light },
    { label: 'Enlaces en modo claro: acento sobre fondo', fg: v.light, bg: BG_LIGHT },
    { label: 'Botón oscuro: texto sobre acento', fg: v.darkInk, bg: v.dark },
    { label: 'Enlaces en modo oscuro: acento sobre fondo', fg: v.dark, bg: BG_DARK },
  ];
}

export function validateAccent(v: Accent) {
  for (const k of ['light', 'lightInk', 'dark', 'darkInk'] as const) {
    if (!HEX.test(v[k] ?? '')) throw new Error(`"${k}" debe ser un color hex de 6 dígitos, por ejemplo #5a3ec8.`);
  }
  for (const c of accentChecks(v)) {
    const r = contrast(c.fg, c.bg);
    if (r < AA) throw new Error(`${c.label}: ${r.toFixed(2)}:1 no cumple AA (mínimo 4.5:1).`);
  }
  return v;
}

const DEFAULT: Accent = { light: '#5a3ec8', lightInk: '#ffffff', dark: '#b9a4ff', darkInk: '#0d0e10' };

const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' };
const badge = (ok: boolean): React.CSSProperties => ({ padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: ok ? '#d9f2e3' : '#fde2e1', color: ok ? '#0b5a2c' : '#8a1c1c' });

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const valid = HEX.test(value);
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span style={row}>
        <input type="color" value={valid ? value : '#000000'} onChange={(e) => onChange(e.target.value)} style={{ width: 44, height: 36, padding: 0, border: 'none', background: 'none' }} aria-label={`${label} (selector)`} />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value.trim())} spellCheck={false} style={{ width: 110, padding: '6px 8px', fontFamily: 'ui-monospace, monospace', border: `1px solid ${valid ? '#ccc' : '#c62a3c'}`, borderRadius: 6 }} aria-label={`${label} (hex)`} />
      </span>
    </label>
  );
}

export function accentField({ label }: { label: string }): BasicFormField<Accent> {
  return {
    kind: 'form',
    label,
    defaultValue: () => DEFAULT,
    parse: (raw) => {
      const v = (raw ?? {}) as Partial<Accent>;
      return { light: v.light ?? DEFAULT.light, lightInk: v.lightInk ?? DEFAULT.lightInk, dark: v.dark ?? DEFAULT.dark, darkInk: v.darkInk ?? DEFAULT.darkInk };
    },
    serialize: (value) => ({ value }),
    validate: (value) => validateAccent(value),
    reader: { parse: (raw) => validateAccent(raw as Accent) },
    Input({ value, onChange, forceValidation }) {
      const set = (k: keyof Accent) => (v: string) => onChange({ ...value, [k]: v });
      const allHex = (['light', 'lightInk', 'dark', 'darkInk'] as const).every((k) => HEX.test(value[k]));
      let error = '';
      try { validateAccent(value); } catch (e) { error = (e as Error).message; }
      return (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ fontWeight: 700 }}>{label}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <ColorInput label="Acento · modo claro" value={value.light} onChange={set('light')} />
            <ColorInput label="Texto sobre acento · modo claro" value={value.lightInk} onChange={set('lightInk')} />
            <ColorInput label="Acento · modo oscuro" value={value.dark} onChange={set('dark')} />
            <ColorInput label="Texto sobre acento · modo oscuro" value={value.darkInk} onChange={set('darkInk')} />
          </div>
          {allHex && (
            <>
              <div style={row}>
                <span style={{ padding: '10px 18px', borderRadius: 12, background: value.light, color: value.lightInk, fontWeight: 600 }}>Botón (claro)</span>
                <span style={{ padding: '10px 18px', borderRadius: 12, background: BG_DARK }}>
                  <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 10, background: value.dark, color: value.darkInk, fontWeight: 600 }}>Botón (oscuro)</span>
                </span>
                <span style={{ padding: '10px 18px', borderRadius: 12, background: BG_LIGHT, color: value.light, fontWeight: 600, textDecoration: 'underline' }}>Enlace</span>
              </div>
              <table style={{ borderCollapse: 'collapse', fontSize: 14 }}>
                <tbody>
                  {accentChecks(value).map((c) => {
                    const r = contrast(c.fg, c.bg);
                    return (
                      <tr key={c.label}>
                        <td style={{ padding: '4px 12px 4px 0' }}>{c.label}</td>
                        <td style={{ padding: '4px 12px', fontFamily: 'ui-monospace, monospace' }}>{r.toFixed(2)}:1</td>
                        <td style={{ padding: '4px 4px' }}><span style={badge(r >= AA)}>AA</span></td>
                        <td style={{ padding: '4px 4px' }}><span style={badge(r >= AAA)}>AAA</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
          {error && (forceValidation || allHex) && (
            <p role="alert" style={{ margin: 0, color: '#8a1c1c', fontWeight: 600 }}>No se puede guardar: {error}</p>
          )}
          {!error && <p style={{ margin: 0, color: '#0b5a2c' }}>Todas las combinaciones cumplen AA. Las marcadas en verde también cumplen AAA.</p>}
        </div>
      );
    },
  };
}
