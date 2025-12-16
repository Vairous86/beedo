import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { promises as fs } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "json-api-middleware",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          try {
            const url = new URL(req.url || "/", "http://localhost");
            const m = url.pathname.match(/^\/api\/json\/([^/]+)$/);
            if (!m) return next();
            const collection = m[1];
            const allowed = new Set([
              "services",
              "platforms",
              "packages",
              "orders",
              "analytics",
              "payment_settings",
              "most_requested",
              "admin_credentials",
            ]);
            if (!allowed.has(collection)) {
              res.statusCode = 400;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ ok: false, error: "Invalid collection" }));
              return;
            }
            const filePath = path.join(process.cwd(), "next-api", "storage", `${collection}.json`);
            const readJson = async () => {
              try {
                const s = await fs.readFile(filePath, "utf-8");
                const j = s ? JSON.parse(s) : [];
                return Array.isArray(j) ? j : [];
              } catch {
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, "[]");
                return [];
              }
            };
            const writeJson = async (data: any[]) => {
              await fs.mkdir(path.dirname(filePath), { recursive: true });
              await fs.writeFile(filePath, JSON.stringify(data));
            };
            const defaults = {
              platforms: [
                {
                  id: "facebook",
                  name: "Facebook",
                  description: "Boost your Facebook presence with likes, followers, and engagement",
                  image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
                  color: "#1877F2",
                },
                {
                  id: "instagram",
                  name: "Instagram",
                  description: "Grow your Instagram with real followers, likes, and views",
                  image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
                  color: "#E4405F",
                },
              ],
              services: [
                {
                  id: "fb-likes",
                  title: "Facebook Page Likes",
                  description: "Increase your Facebook page likes with real users",
                  fullDescription: "Boost your Facebook page credibility with genuine page likes from real, active users.",
                  prices: { SAR: 75, EGP: 500, USD: 20 },
                  deliveryTime: "24-48 hours",
                  guarantee: "30-day refill guarantee",
                  image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
                  platform: "facebook",
                  serviceType: "Likes",
                },
                {
                  id: "ig-followers",
                  title: "Instagram Followers",
                  description: "Grow your Instagram with real followers",
                  fullDescription: "Build your Instagram presence with high-quality followers from real accounts.",
                  prices: { SAR: 85, EGP: 550, USD: 23 },
                  deliveryTime: "24-48 hours",
                  guarantee: "60-day refill guarantee",
                  image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
                  platform: "instagram",
                  serviceType: "Followers",
                },
              ],
              payment_settings: [
                { method: "STC Pay", account_number: "0500000000", qr_url: "", currency: "SAR" },
                { method: "Al Rajhi", account_number: "1234567890123456", qr_url: "", currency: "SAR" },
                { method: "Vodafone Cash", account_number: "01000000000", qr_url: "", currency: "EGP" },
              ],
              admin_credentials: [{ username: "admin", password: "admin123" }],
            } as Record<string, any[]>;
            const bodyStr = await new Promise<string>((resolve) => {
              let b = "";
              req.on("data", (chunk) => (b += chunk));
              req.on("end", () => resolve(b));
            });
            const method = (req.method || "GET").toUpperCase();
            if (method === "GET") {
              let data = await readJson();
              if (data.length === 0 && defaults[collection]) {
                data = defaults[collection];
                await writeJson(data);
              }
              res.statusCode = 200;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ ok: true, data }));
              return;
            }
            if (method === "POST") {
              const payload = bodyStr ? JSON.parse(bodyStr) : {};
              const data = await readJson();
              const id = payload?.id || (Date.now() + Math.floor(Math.random() * 1000)).toString();
              const item = { id, ...payload };
              data.push(item);
              await writeJson(data);
              res.statusCode = 201;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ ok: true, item }));
              return;
            }
            if (method === "PUT") {
              const payload = bodyStr ? JSON.parse(bodyStr) : {};
              if (!payload?.id) {
                res.statusCode = 400;
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify({ ok: false, error: "Missing id" }));
                return;
              }
              const data = await readJson();
              const idx = data.findIndex((r: any) => r.id === payload.id);
              if (idx === -1) {
                res.statusCode = 404;
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify({ ok: false, error: "Not found" }));
                return;
              }
              const updated = { ...data[idx], ...payload };
              data[idx] = updated;
              await writeJson(data);
              res.statusCode = 200;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ ok: true, item: updated }));
              return;
            }
            if (method === "DELETE") {
              const payload = bodyStr ? JSON.parse(bodyStr) : {};
              if (!payload?.id) {
                res.statusCode = 400;
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify({ ok: false, error: "Missing id" }));
                return;
              }
              const data = await readJson();
              const exists = data.some((r: any) => r.id === payload.id);
              if (!exists) {
                res.statusCode = 404;
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify({ ok: false, error: "Not found" }));
                return;
              }
              const next = data.filter((r: any) => r.id !== payload.id);
              await writeJson(next);
              res.statusCode = 200;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ ok: true, id: payload.id }));
              return;
            }
            res.statusCode = 405;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify({ ok: false, error: "Method Not Allowed" }));
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, error: e?.message || "Internal Error" }));
          }
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
