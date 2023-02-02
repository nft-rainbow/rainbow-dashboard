import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import Unocss from 'unocss/vite';
import presetIcons from '@unocss/preset-icons';
import presetWind from '@unocss/preset-wind';
import transformerDirective from '@unocss/transformer-directives';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return defineConfig({
    server: {
      proxy: {
        '^/api/.*': {
          target: `${env.VITE_ServiceHost}/`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
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
      viteCompression({
        threshold: 1024000,
      }),
    ],
    resolve: {
      alias: {
        // '@': path.resolve(__dirname, './src'),
        // '@/assets': path.resolve(__dirname, 'src/assets'),
        '@utils': path.resolve(__dirname, './src/utils'),
        // '@/modules': path.resolve(__dirname, 'src/modules'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@router': path.resolve(__dirname, './src/router'),
        // '@store': path.resolve(__dirname, 'src/store'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@components': path.resolve(__dirname, './src/components'),
        '@services': path.resolve(__dirname, './src/services'),
      },
    },
    build: {},
  });
};
