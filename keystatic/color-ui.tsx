// Piezas de interfaz compartidas por los campos de color del panel (acento y cruces del hero).
import type { ReactNode } from 'react';

export const HEX = /^#[0-9a-fA-F]{6}$/;

// Estilos con prefijo propio: Keystatic no aplica su tipografía dentro de campos personalizados
export const COLOR_CSS = `
.kc { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; color: inherit; display: grid; gap: 16px; }
.kc-mode, .kc-sliders { color: #1a1d21; } /* tarjetas blancas: tinta fija aunque el panel esté en modo oscuro */
.kc * { box-sizing: border-box; }
.kc-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.kc-title { margin: 0; font-size: 16px; font-weight: 650; letter-spacing: -0.01em; }
.kc-sub { margin: 4px 0 0; font-size: 13px; opacity: 0.72; max-width: 56ch; }
.kc-mode .kc-sub { opacity: 1; color: #5b616b; }
.kc-status { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; }
.kc-status--ok { background: #e3f5ea; color: #0b5a2c; }
.kc-status--bad { background: #fde4e3; color: #8a1c1c; }
.kc-modes { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
.kc-mode { border-radius: 18px; overflow: hidden; border: 1px solid #e2e4e8; background: #fff; }
.kc-stage { padding: 20px; display: grid; gap: 14px; }
.kc-stage__tag { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; opacity: 0.7; }
.kc-stage__title { margin: 0; font-size: 22px; font-weight: 650; letter-spacing: -0.02em; line-height: 1.1; }
.kc-stage__text { margin: 0; font-size: 14px; line-height: 1.5; opacity: 0.85; }
.kc-stage__text a { font-weight: 600; text-underline-offset: 3px; }
.kc-stage__row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.kc-btn { display: inline-flex; align-items: center; min-height: 40px; padding: 0 18px; border-radius: 12px; font-size: 14px; font-weight: 600; }
.kc-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.kc-chip::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.kc-controls { padding: 16px 20px 18px; display: grid; gap: 14px; border-top: 1px solid #eceef1; }
.kc-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.kc-swatch { display: grid; gap: 6px; font-size: 12px; font-weight: 600; color: #5b616b; }
.kc-swatch__box { display: flex; align-items: center; gap: 8px; padding: 6px; border: 1px solid #dfe2e6; border-radius: 12px; background: #fafbfc; transition: border-color 160ms ease, box-shadow 160ms ease; }
.kc-swatch__box:focus-within { border-color: #5a3ec8; box-shadow: 0 0 0 3px rgb(90 62 200 / 0.18); }
.kc-swatch__chip { position: relative; flex: none; width: 34px; height: 34px; border-radius: 9px; box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.12); cursor: pointer; overflow: hidden; }
.kc-swatch__chip input { position: absolute; inset: -8px; width: calc(100% + 16px); height: calc(100% + 16px); opacity: 0; cursor: pointer; }
.kc-swatch__hex { width: 100%; min-width: 0; border: 0; background: transparent; font: 500 14px ui-monospace, SFMono-Regular, Menlo, monospace; color: #1a1d21; text-transform: lowercase; outline: none; }
.kc-swatch__hex[aria-invalid="true"] { color: #c62a3c; }
.kc-checks { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.kc-check { display: grid; grid-template-columns: 1fr auto; gap: 6px 10px; align-items: center; font-size: 13px; }
.kc-check__label { color: #3b4048; }
.kc-check__ratio { font: 600 13px ui-monospace, SFMono-Regular, Menlo, monospace; display: inline-flex; gap: 6px; align-items: center; }
.kc-meter { grid-column: 1 / -1; position: relative; height: 6px; border-radius: 999px; background: #eceef1; }
.kc-meter__fill { position: absolute; inset: 0 auto 0 0; border-radius: inherit; transition: width 240ms cubic-bezier(.22,1,.36,1), background-color 240ms ease; }
.kc-meter__mark { position: absolute; top: -3px; bottom: -3px; width: 2px; border-radius: 2px; background: #9aa0a9; }
.kc-pill { padding: 2px 7px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.02em; }
.kc-pill--ok { background: #e3f5ea; color: #0b5a2c; }
.kc-pill--no { background: #f1f2f4; color: #8a9099; text-decoration: line-through; }
.kc-error { margin: 0; padding: 10px 14px; border-radius: 12px; background: #fde4e3; color: #8a1c1c; font-size: 13px; font-weight: 600; }
.kc-seg { display: inline-flex; padding: 4px; gap: 4px; border-radius: 12px; background: #f1f2f4; }
.kc-seg button { min-height: 34px; padding: 0 14px; border: 0; border-radius: 9px; background: transparent; font: 600 13px ui-sans-serif, system-ui, sans-serif; color: #5b616b; cursor: pointer; }
.kc-seg button[aria-pressed="true"] { background: #fff; color: #1a1d21; box-shadow: 0 1px 2px rgb(0 0 0 / 0.12); }
.kc-presets { display: flex; flex-wrap: wrap; gap: 8px; }
.kc-preset { width: 28px; height: 28px; border-radius: 50%; border: 0; cursor: pointer; box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.12); transition: transform 140ms ease; }
.kc-preset:hover { transform: scale(1.1); }
.kc-preset[aria-pressed="true"] { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #1a1d21; }
`;

export function ColorStyles() {
  return <style>{COLOR_CSS}</style>;
}

export function Swatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const valid = HEX.test(value);
  return (
    <label className="kc-swatch">
      {label}
      <span className="kc-swatch__box">
        <span className="kc-swatch__chip" style={{ background: valid ? value : '#fff' }}>
          <input type="color" value={valid ? value : '#000000'} onChange={(e) => onChange(e.target.value)} aria-label={`${label}: selector de color`} />
        </span>
        <input className="kc-swatch__hex" type="text" value={value} onChange={(e) => onChange(e.target.value.trim())} spellCheck={false} maxLength={7} aria-invalid={!valid} aria-label={`${label}: código hex`} />
      </span>
    </label>
  );
}

export function Head({ title, sub, status }: { title: string; sub?: string; status?: ReactNode }) {
  return (
    <div className="kc-head">
      <div>
        <p className="kc-title">{title}</p>
        {sub && <p className="kc-sub">{sub}</p>}
      </div>
      {status}
    </div>
  );
}
