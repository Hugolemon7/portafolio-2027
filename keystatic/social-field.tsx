// Vista previa de cómo se ve el link al compartirlo (LinkedIn, WhatsApp, X…), con la imagen, el título y la
// descripción publicados en este momento. No guarda nada: solo muestra lo que verán las redes.
import { useEffect, useState } from 'react';
import type { BasicFormField } from '@keystatic/core';
import { ColorStyles, Head } from './color-ui';

type Meta = { image: string; title: string; description: string; host: string; w: number; h: number };

const CSS = `
.ks-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; }
.ks-card { border: 1px solid #e2e4e8; border-radius: 14px; overflow: hidden; background: #fff; color: #1a1d21; font-family: ui-sans-serif, system-ui, sans-serif; }
.ks-card__img { display: block; width: 100%; aspect-ratio: 1200 / 630; object-fit: cover; background: #eceef1; }
.ks-card__body { display: grid; gap: 4px; padding: 10px 14px 12px; }
.ks-card__host { font-size: 12px; color: #5b616b; text-transform: lowercase; }
.ks-card__title { margin: 0; font-size: 15px; font-weight: 650; line-height: 1.3; }
.ks-card__desc { margin: 0; font-size: 13px; line-height: 1.4; color: #5b616b; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ks-chat { padding: 14px; border-radius: 14px; background: #e7f6dc; }
.ks-chat .ks-card { border: 0; border-radius: 10px; }
.ks-label { margin: 0 0 6px; font: 700 11px ui-sans-serif, system-ui, sans-serif; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.7; }
.ks-note { margin: 0; font-size: 12px; opacity: 0.75; }
`;

function Card({ m }: { m: Meta }) {
  return (
    <div className="ks-card">
      <img className="ks-card__img" src={m.image} alt="" />
      <div className="ks-card__body">
        <span className="ks-card__host">{m.host}</span>
        <p className="ks-card__title">{m.title}</p>
        <p className="ks-card__desc">{m.description}</p>
      </div>
    </div>
  );
}

export function socialPreviewField({ label }: { label: string }): BasicFormField<null> {
  return {
    kind: 'form',
    label,
    defaultValue: () => null,
    parse: () => null,
    serialize: () => ({ value: undefined }),
    validate: (v) => v,
    reader: { parse: () => null },
    Input() {
      const [lang, setLang] = useState<'es' | 'en'>('es');
      const [m, setM] = useState<Meta | null>(null);
      useEffect(() => {
        setM(null);
        fetch(lang === 'es' ? '/' : '/en/', { cache: 'no-store' }).then((r) => r.text()).then((html) => {
          const meta = (p: string) => new RegExp(`<meta[^>]+property="${p}"[^>]+content="([^"]*)"`).exec(html)?.[1] ?? '';
          const image = meta('og:image').replace(/^https?:\/\/[^/]+/, '');         // misma página, sin el dominio
          const probe = new Image();
          probe.onload = () => setM({ image: `${image}?v=${Date.now()}`, title: meta('og:title'), description: meta('og:description'), host: location.host, w: probe.naturalWidth, h: probe.naturalHeight });
          probe.onerror = () => setM({ image, title: meta('og:title'), description: meta('og:description'), host: location.host, w: 0, h: 0 });
          probe.src = `${image}?v=${Date.now()}`;
        }).catch(() => setM(null));
      }, [lang]);
      const ok = m && m.w === 1200 && m.h === 630;
      return (
        <div className="kc">
          <ColorStyles />
          <style>{CSS}</style>
          <Head
            title={label}
            sub="Así se ve tu link al compartirlo, con lo publicado ahora. La imagen automática se vuelve a generar en cada publicación con tus textos, colores y tipografías del momento."
            status={
              <div className="kc-seg" role="group" aria-label="Idioma">
                <button type="button" aria-pressed={lang === 'es'} onClick={() => setLang('es')}>Español</button>
                <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
              </div>
            }
          />
          {m ? (
            <>
              <div className="ks-cards">
                <div><p className="ks-label">LinkedIn / Facebook</p><Card m={m} /></div>
                <div><p className="ks-label">WhatsApp</p><div className="ks-chat"><Card m={m} /></div></div>
              </div>
              <p className="ks-note">
                {m.w ? `Imagen: ${m.w} × ${m.h} px. ` : ''}
                {m.w && !ok ? 'Recomendado: 1200 × 630 px para que no se recorte. ' : ''}
                Título y descripción se editan en Textos · General → SEO. Las redes guardan el preview en caché: un cambio puede tardar en verse (en LinkedIn puedes forzarlo con Post Inspector).
              </p>
            </>
          ) : <p className="ks-note">Cargando la vista previa…</p>}
        </div>
      );
    },
  };
}
