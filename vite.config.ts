import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

function journalStudioPlugin(): Plugin {
  return {
    name: 'journal-studio-api',
    configureServer(server) {
      // 1. Save journal data directly to src/data/journalData.json
      server.middlewares.use('/api/save-journal', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              const dataToSave = parsed.data || parsed;
              const targetPath = path.resolve(__dirname, 'src/data/journalData.json');
              fs.writeFileSync(targetPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                success: true, 
                message: 'Data kenangan berhasil disimpan secara permanen ke src/data/journalData.json' 
              }));
            } catch (error: unknown) {
              const err = error as Error;
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });

      // 2. Upload media (photos or audio) to public folder
      server.middlewares.use('/api/upload-media', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { filename, base64Data, mediaType } = JSON.parse(body);
              const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
              const buffer = Buffer.from(cleanBase64, 'base64');

              const subfolder = mediaType === 'audio' ? 'audio' : 'photos';
              const targetDir = path.resolve(__dirname, 'public', subfolder);
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }

              // Sanitize filename
              const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
              const finalPath = path.resolve(targetDir, safeName);
              fs.writeFileSync(finalPath, buffer);

              const relativeUrl = `./${subfolder}/${safeName}`;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                success: true, 
                url: relativeUrl,
                fileName: safeName,
                message: `File ${safeName} berhasil disimpan ke public/${subfolder}`
              }));
            } catch (error: unknown) {
              const err = error as Error;
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    journalStudioPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'Sophie Grisella Olivia 25th Journal',
        short_name: "Sophie's Journal",
        description: 'Yearly Journal & Memories Progressive Web App',
        theme_color: '#FDFBF7',
        background_color: '#FDFBF7',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
