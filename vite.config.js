import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env sources (not just VITE_).
  const env = loadEnv(mode, process.cwd(), '');
  
  // Assign key to process.env so it is available to the API handlers
  process.env.OPEN_ROUTER_KEY = (env.OPEN_ROUTER_KEY || process.env.OPEN_ROUTER_KEY || '').trim();

  return {
    root: '.',
    publicDir: 'public',
    server: {
      port: 3000,
      open: true,
    },
    plugins: [
      {
        name: 'api-chat-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            // Intercept /api/chat requests (both with and without trailing slash or .js extension)
            const url = req.url.split('?')[0];
            console.log(`[Vite Proxy] URL: "${url}", Method: "${req.method}", Original URL: "${req.url}"`);
            if (url === '/api/chat' || url === '/api/chat.js') {
              if (req.method === 'POST') {
                let bodyStr = '';
                req.on('data', chunk => {
                  bodyStr += chunk.toString();
                });
                req.on('end', async () => {
                  let parsedBody = {};
                  try {
                    parsedBody = JSON.parse(bodyStr);
                  } catch (e) {
                    // Ignore parse error
                  }

                  // Mock Vercel response helper functions
                  res.status = (code) => {
                    res.statusCode = code;
                    return res;
                  };
                  res.json = (data) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    return res;
                  };

                  // Add req.body
                  req.body = parsedBody;

                  try {
                    // Dynamically import the api/chat handler
                    // Using new URL + href prevents Vite from statically parsing this as a glob import at build time
                    const handlerPath = new URL('./api/chat.js', import.meta.url).href + `?t=${Date.now()}`;
                    const chatModule = await import(handlerPath);
                    await chatModule.default(req, res);
                  } catch (err) {
                    console.error('Error executing chat handler:', err);
                    res.status(500).json({ error: err.message });
                  }
                });
              } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Method not allowed' }));
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    build: {
      outDir: 'dist',
    },
  };
});

