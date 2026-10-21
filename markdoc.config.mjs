import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

// Bloques disponibles dentro de los casos de estudio (también se configuran en Keystatic)
export default defineMarkdocConfig({
  tags: {
    figure: {
      render: component('./src/components/md/Figure.astro'),
      attributes: {
        src: { type: String, required: true },
        alt: { type: String, required: true },
        caption: { type: String },
        wide: { type: Boolean, default: false },
      },
    },
    compare: {
      render: component('./src/components/md/Compare.astro'),
      attributes: {
        before: { type: String, required: true },
        after: { type: String, required: true },
        beforeLabel: { type: String, default: 'Antes' },
        afterLabel: { type: String, default: 'Después' },
        alt: { type: String, required: true },
        caption: { type: String },
      },
    },
    callout: {
      render: component('./src/components/md/Callout.astro'),
      attributes: { title: { type: String } },
    },
  },
});
