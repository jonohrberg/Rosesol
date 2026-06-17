const C="rosesol-cache-v1";
const ASSETS=["/","/index.html","/manifest.webmanifest"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS)).catch(()=>{}).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET") return;
  const isHTML = req.mode==="navigate" || (req.headers.get("accept")||"").includes("text/html");
  if(isHTML){
    e.respondWith(
      fetch(req).then(res=>{ const cp=res.clone(); caches.open(C).then(c=>c.put(req,cp)).catch(()=>{}); return res; })
                .catch(()=> caches.match(req).then(r=> r || caches.match("/index.html")))
    );
  } else {
    e.respondWith(
      caches.match(req).then(c=> c || fetch(req).then(res=>{ const cp=res.clone(); caches.open(C).then(x=>x.put(req,cp)).catch(()=>{}); return res; }).catch(()=>undefined))
    );
  }
});
