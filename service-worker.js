const CACHE='km-delivery-v2';
const APP=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(APP.map(u=>c.add(u).catch(()=>{})))));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  // Solo archivos propios de la app; las APIs (Photon, Nominatim, OSRM) van siempre directo a internet.
  if(e.request.method!=='GET'||url.origin!==self.location.origin)return;
  e.respondWith(
    fetch(e.request)
      .then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;})
      .catch(()=>caches.match(e.request))
  );
});
