import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '.data');
const STORE_FILE = path.join(DATA_DIR, 'orbita-sync-store.json');

export interface CollectionMeta {
  updatedAt: string;
  isCustom: boolean;
  clientId: string;
  hash: string;
}

export interface SyncStoreState {
  version: number;
  updatedAt: string;
  collections: Record<string, any>;
  meta: Record<string, CollectionMeta>;
}

function computeQuickHash(val: any): string {
  try {
    const str = JSON.stringify(val);
    let h = 2166136261;
    const step = Math.max(1, Math.floor(str.length / 500));
    for (let i = 0; i < str.length; i += step) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return `${str.length}:${(h >>> 0).toString(36)}`;
  } catch {
    return `0:0`;
  }
}

function loadStoreFromDisk(): SyncStoreState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.collections) {
        return {
          version: typeof parsed.version === 'number' ? parsed.version : 1,
          updatedAt: parsed.updatedAt || new Date().toISOString(),
          collections: parsed.collections || {},
          meta: parsed.meta || {},
        };
      }
    }
  } catch (err) {
    console.warn('[OrbitaSyncHub] Failed to read existing store, initializing fresh store:', err);
  }
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    collections: {},
    meta: {},
  };
}

let syncStore: SyncStoreState = loadStoreFromDisk();
let saveTimer: NodeJS.Timeout | null = null;

function persistStoreToDisk(immediate = false): void {
  const writeNow = () => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${STORE_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(syncStore), 'utf-8');
      fs.renameSync(tmpFile, STORE_FILE);
    } catch (err) {
      console.warn('[OrbitaSyncHub] Failed to persist sync store to disk:', err);
    }
  };

  if (immediate) {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    writeNow();
    return;
  }

  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    writeNow();
  }, 250);
}

interface SseClient {
  id: string;
  res: express.Response;
}

const sseClients = new Set<SseClient>();

function broadcastSyncUpdate(changedKeys: string[], sourceClientId: string) {
  if (changedKeys.length === 0 || sseClients.size === 0) return;
  const payload = JSON.stringify({
    version: syncStore.version,
    updatedAt: syncStore.updatedAt,
    changedKeys,
    sourceClientId,
  });
  for (const client of sseClients) {
    try {
      client.res.write(`event: sync-update\ndata: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Enable cross-origin access so any browser, mobile device, or external preview domain can sync
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Orbita-Client-Id, Cache-Control'
    );
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  // High payload limit to support base64 gallery photos, custom backgrounds, logos, and signatures
  app.use(express.json({ limit: '60mb' }));

  // 1. Health & Version Check
  app.get('/api/sync/ping', (_req, res) => {
    res.json({
      ok: true,
      version: syncStore.version,
      updatedAt: syncStore.updatedAt,
      collectionKeys: Object.keys(syncStore.collections),
      meta: syncStore.meta,
    });
  });

  // 2. Get Full or Filtered Synchronized State
  app.get('/api/sync/state', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const keysParam = typeof req.query.keys === 'string' ? req.query.keys : '';
    if (keysParam) {
      const requestedKeys = keysParam
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);
      const filteredCollections: Record<string, any> = {};
      const filteredMeta: Record<string, CollectionMeta> = {};
      for (const k of requestedKeys) {
        if (k in syncStore.collections) {
          filteredCollections[k] = syncStore.collections[k];
          filteredMeta[k] = syncStore.meta[k];
        }
      }
      res.json({
        ok: true,
        version: syncStore.version,
        updatedAt: syncStore.updatedAt,
        collections: filteredCollections,
        meta: filteredMeta,
      });
      return;
    }

    res.json({
      ok: true,
      version: syncStore.version,
      updatedAt: syncStore.updatedAt,
      collections: syncStore.collections,
      meta: syncStore.meta,
    });
  });

  // 3. Push Inputted State / Collections from Device to Cross-Device Hub
  app.post('/api/sync/push', (req, res) => {
    try {
      const body = req.body || {};
      const incomingCollections: Record<string, any> = body.collections || {};
      const customFlags: Record<string, boolean> = body.customFlags || {};
      const mode: 'hydrate' | 'auto' | 'force' = body.mode || 'auto';
      const clientId: string = String(body.clientId || req.headers['x-orbita-client-id'] || 'anonymous');
      const nowIso = new Date().toISOString();

      const changedKeys: string[] = [];

      for (const [key, value] of Object.entries(incomingCollections)) {
        if (value === undefined || value === null) continue;

        const existingMeta = syncStore.meta[key];
        const existingValue = syncStore.collections[key];
        const incomingIsCustom = Boolean(customFlags[key] ?? (mode !== 'hydrate'));
        const incomingHash = computeQuickHash(value);

        // During initial hydration from a browser's localStorage:
        // - If server doesn't have this collection yet, accept it.
        // - If server only has default seed data (!existingMeta.isCustom) and this client has custom user-inputted data (incomingIsCustom), upgrade server to client's custom data!
        // - Otherwise, during hydration, do not overwrite existing custom server data with another device's seed data.
        if (mode === 'hydrate') {
          if (existingValue === undefined) {
            syncStore.collections[key] = value;
            syncStore.meta[key] = {
              updatedAt: nowIso,
              isCustom: incomingIsCustom,
              clientId,
              hash: incomingHash,
            };
            changedKeys.push(key);
          } else if (!existingMeta?.isCustom && incomingIsCustom && existingMeta?.hash !== incomingHash) {
            syncStore.collections[key] = value;
            syncStore.meta[key] = {
              updatedAt: nowIso,
              isCustom: true,
              clientId,
              hash: incomingHash,
            };
            changedKeys.push(key);
          }
          continue;
        }

        // For 'auto' (live user mutation) or 'force' (explicit manual sync):
        // Avoid overwriting customized server data with non-custom seed data unless mode === 'force' AND incomingIsCustom
        if (mode === 'auto' && existingMeta?.isCustom && !incomingIsCustom) {
          continue;
        }

        if (!existingMeta || existingMeta.hash !== incomingHash || mode === 'force') {
          syncStore.collections[key] = value;
          syncStore.meta[key] = {
            updatedAt: nowIso,
            isCustom: incomingIsCustom || Boolean(existingMeta?.isCustom),
            clientId,
            hash: incomingHash,
          };
          changedKeys.push(key);
        }
      }

      if (changedKeys.length > 0) {
        syncStore.version += 1;
        syncStore.updatedAt = nowIso;
        persistStoreToDisk(mode === 'force');
        broadcastSyncUpdate(changedKeys, clientId);
      }

      res.json({
        ok: true,
        version: syncStore.version,
        updatedAt: syncStore.updatedAt,
        changedKeys,
        meta: syncStore.meta,
      });
    } catch (err: any) {
      console.error('[OrbitaSyncHub] Error processing /api/sync/push:', err);
      res.status(500).json({
        ok: false,
        error: err?.message || 'Internal sync error',
      });
    }
  });

  // 4. Real-Time Server-Sent Events (SSE) Stream for Instant Cross-Device Updates
  app.get('/api/sync/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const clientId = String(req.query.clientId || Math.random().toString(36).slice(2));
    const client: SseClient = { id: clientId, res };
    sseClients.add(client);

    // Send initial handshake with current version
    res.write(
      `event: connected\ndata: ${JSON.stringify({
        version: syncStore.version,
        updatedAt: syncStore.updatedAt,
      })}\n\n`
    );

    const keepAlive = setInterval(() => {
      try {
        res.write(`: heartbeat ${Date.now()}\n\n`);
      } catch {
        clearInterval(keepAlive);
        sseClients.delete(client);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(client);
    });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OrbitaServer] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
