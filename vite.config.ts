import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

function apiProxyPlugin(): Plugin {
  return {
    name: 'api-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Parse JSON body
        let bodyStr = '';
        req.on('data', chunk => {
          bodyStr += chunk;
        });

        req.on('end', async () => {
          try {
            const body = bodyStr ? JSON.parse(bodyStr) : {};

            if (req.url === '/api/gemini/thinking' && req.method === 'POST') {
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on server.' }));
              }

              const ai = new GoogleGenAI({
                apiKey: apiKey,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build',
                  },
                },
              });

              const response = await ai.models.generateContent({
                model: 'gemini-4-argon',
                contents: body.prompt,
                config: {
                  systemInstruction: 'Anda adalah Asisten Pedagogik & Analisis Akademik Cerdas SMK Mardi Yuana Cikembar. Berikan analisis mendalam, objektif, solutif, dan rekomendasi tindak lanjut bagi guru, wali kelas, dan kepala sekolah dalam Bahasa Indonesia.',
                  thinkingConfig: {
                    thinkingLevel: ThinkingLevel.HIGH,
                  },
                },
              });

              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ text: response.text }));
            }

            if (req.url === '/api/veo/generate' && req.method === 'POST') {
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on server.' }));
              }

              const ai = new GoogleGenAI({
                apiKey: apiKey,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build',
                  },
                },
              });

              // Start video generation with veo-3.1-fast-generate-preview
              const aspectRatio = body.aspectRatio === '9:16' ? '9:16' : '16:9';
              
              let payload: any = {
                model: 'veo-3.1-fast-generate-preview',
                prompt: body.prompt || 'Cinematic video of school activities at vocational workshop SMK Mardi Yuana Cikembar',
                config: {
                  numberOfVideos: 1,
                  aspectRatio: aspectRatio,
                },
              };

              if (body.imageBytes && body.mimeType) {
                payload.image = {
                  imageBytes: body.imageBytes,
                  mimeType: body.mimeType,
                };
              }

              const operation = await ai.models.generateVideos(payload);
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ operationName: operation.name }));
            }

            if (req.url === '/api/veo/status' && req.method === 'POST') {
              const apiKey = process.env.GEMINI_API_KEY;
              const ai = new GoogleGenAI({
                apiKey: apiKey,
                httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
              });

              const op: any = { name: body.operationName };
              const updated = await ai.operations.getVideosOperation({ operation: op });
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ done: updated.done, response: updated.response }));
            }

            next();
          } catch (err: any) {
            console.error('API Error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), apiProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
