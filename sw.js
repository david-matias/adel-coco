/* Service worker do Adel Coco: deixa o app abrir sem internet.
   __BUILD__ e __ARQUIVOS__ são preenchidos por scripts/finalize-sw.mjs depois do build.
   Só guarda arquivos do próprio site; chamadas à API nunca passam por aqui. */
const BUILD = "101ef484ff62";
const ARQUIVOS = ["404/","__next.__PAGE__.txt","__next._full.txt","__next._tree.txt","_next/static/8zWpUGl_nOsbaNv7EfMsX/_buildManifest.js","_next/static/8zWpUGl_nOsbaNv7EfMsX/_clientMiddlewareManifest.js","_next/static/8zWpUGl_nOsbaNv7EfMsX/_ssgManifest.js","_next/static/chunks/03zzfm6zze4kg.js","_next/static/chunks/0cz1d0mv5g_q7.js","_next/static/chunks/0mtq9hx8m9vt0.js","_next/static/chunks/0o12oh5m1pndn.js","_next/static/chunks/0pp1szotz8lzf.css","_next/static/chunks/1d-3ziz_810o8.js","_next/static/chunks/1s-yrksotgfs1.js","_next/static/chunks/1u2w_v-h75gkf.js","_next/static/chunks/23e6jep2anmtk.js","_next/static/chunks/310vm2bl3xxpt.js","_next/static/chunks/3b7v8xei-k6e1.js","_next/static/chunks/3l4bojtojfluj.js","_next/static/chunks/3lfci17tjpldo.js","_next/static/chunks/3qfy96eoyh-ek.js","_next/static/chunks/40w3mxv-hq-xy.js","_next/static/chunks/43vok5tl-t0e8.js","_next/static/chunks/turbopack-2u1d16houkiyo.js","_not-found/__next._full.txt","_not-found/__next._not-found/__PAGE__.txt","_not-found/__next._tree.txt","_not-found/","_not-found/index.txt","compras/__next.!KGFwcCk/compras/__PAGE__.txt","compras/__next._full.txt","compras/__next._tree.txt","compras/detalhe/__next.!KGFwcCk/compras/detalhe/__PAGE__.txt","compras/detalhe/__next._full.txt","compras/detalhe/__next._tree.txt","compras/detalhe/","compras/detalhe/index.txt","compras/","compras/index.txt","compras/nova/__next.!KGFwcCk/compras/nova/__PAGE__.txt","compras/nova/__next._full.txt","compras/nova/__next._tree.txt","compras/nova/","compras/nova/index.txt","fornecedores/__next.!KGFwcCk/fornecedores/__PAGE__.txt","fornecedores/__next._full.txt","fornecedores/__next._tree.txt","fornecedores/","fornecedores/index.txt","icons/apple-touch-icon.png","icons/favicon.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","./","index.txt","login/__next._full.txt","login/__next._tree.txt","login/__next.login/__PAGE__.txt","login/","login/index.txt","logo.png","manifest.webmanifest"];
const CACHE = `adel-coco-${BUILD}`;
const ESCOPO = self.registration.scope;
const url = (caminho) => new URL(caminho, ESCOPO).href;

self.addEventListener("install", (ev) => {
  // Sem skipWaiting automático: o app avisa a pessoa e só então troca de versão.
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS.map(url))));
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("adel-coco-") && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("message", (ev) => {
  if (ev.data && ev.data.tipo === "PULAR_ESPERA") self.skipWaiting();
});

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET") return;
  if (!req.url.startsWith(ESCOPO)) return; // outra origem (API) ou fora do escopo
  ev.respondWith(responder(req));
});

async function responder(req) {
  const cache = await caches.open(CACHE);
  const guardado = await cache.match(req, { ignoreSearch: true }); // /compras/detalhe/?id=… usa a mesma página
  if (guardado) return guardado;
  try {
    const resp = await fetch(req);
    if (resp.ok) cache.put(req, resp.clone());
    return resp;
  } catch {
    if (req.mode === "navigate") {
      const inicio = await cache.match(url("./"));
      if (inicio) return inicio;
    }
    return Response.error();
  }
}
