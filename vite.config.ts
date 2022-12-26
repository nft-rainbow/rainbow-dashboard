import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import Unocss from 'unocss/vite';
import presetIcons from '@unocss/preset-icons';
import presetWind from '@unocss/preset-wind';
import transformerDirective from '@unocss/transformer-directives';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  server: {
    proxy: {},
  },
  plugins: [
    Unocss({
      transformers: [transformerDirective()],
      presets: [
        presetWind(),
        presetIcons({
          prefix: 'i-',
          extraProperties: {
            display: 'inline-block',
            'vertical-align': 'middle',
          },
        }),
      ],
    }),
    react(),
  ],
  resolve: {
    alias: {
      // '@': path.resolve(__dirname, './src'),
      // '@/assets': path.resolve(__dirname, 'src/assets'),
      // '@/utils': path.resolve(__dirname, 'src/utils'),
      // '@/modules': path.resolve(__dirname, 'src/modules'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@router': path.resolve(__dirname, 'src/router'),
      // '@store': path.resolve(__dirname, 'src/store'),
      // '@hooks': path.resolve(__dirname, 'src/hooks'),
      // '@components': path.resolve(__dirname, 'src/components'),
      '@services': path.resolve(__dirname, 'src/services'),
    },
  },
  build: {
    rollupOptions: {
      plugins: [visualizer()],
    },
  },
});
