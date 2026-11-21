/* Service worker: giúp mở ứng dụng khi mất mạng. Tăng số phiên bản V khi đổi danh sách file. */
var V='cat-gac-v1';
var CORE=['./','./index.html','./firebase-config.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
var LIB=/(^|\.)(gstatic\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com)$/;
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(V).then(function(c){return Promise.all(CORE.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
function keep(req,res){
  if(res&&(res.ok||res.type==='opaque')){var cp=res.clone();caches.open(V).then(function(c){c.put(req,cp)})}
  return res;
}
self.addEventListener('fetch',function(e){
  var r=e.request;if(r.method!=='GET')return;
  var u=new URL(r.url);
  if(u.origin===self.location.origin){
    /* file của ứng dụng: ưu tiên bản mới nhất khi có mạng, không có mạng dùng bản đã lưu */
    e.respondWith(fetch(r).then(function(res){return keep(r,res)}).catch(function(){
      return caches.match(r,{ignoreSearch:true}).then(function(m){return m||caches.match('./index.html')});
    }));
    return;
  }
  if(LIB.test(u.hostname)){
    /* thư viện và phông chữ: dùng bản đã lưu, nếu chưa có thì tải rồi lưu */
    e.respondWith(caches.match(r).then(function(m){return m||fetch(r).then(function(res){return keep(r,res)})}));
  }
});
