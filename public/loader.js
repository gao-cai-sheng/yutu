'use strict';
(async()=>{
 const status=document.querySelector('#saveState');
 async function readChunk(file){
  const response=await fetch(file.path);
  if(!response.ok)throw Error('地图资料加载失败（'+response.status+'）');
  const stream=response.body.pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).json();
 }
 try{
  if(location.protocol==='file:')throw Error('请通过本地网页服务打开');
  if(typeof DecompressionStream==='undefined')throw Error('请使用支持解压缩的新版 Chrome、Edge、Firefox 或 Safari');
  const response=await fetch('data/maps/manifest.json');
  if(!response.ok)throw Error('无法读取地图目录');
  const manifest=await response.json();
  if(manifest.version!==1)throw Error('地图资料版本不匹配');
  let complete=0;const total=manifest.packs.reduce((n,p)=>n+p.chunks.length+(p.header?1:0),0);
  for(const pack of manifest.packs){
   status.textContent='正在加载地图 · '+pack.title;
   const data=pack.header?await readChunk(pack.header):[];
   if(pack.header)complete++;
   const rows=pack.shape==='regions'?data.regions=[]:pack.shape==='features'?data.features=[]:data;
   // Bound both network concurrency and decompressed buffers; preserve source order.
   for(let i=0;i<pack.chunks.length;i+=4){
    const batch=await Promise.all(pack.chunks.slice(i,i+4).map(async file=>{
     const chunk=await readChunk(file);
     status.textContent='正在加载地图 · '+pack.title+' '+Math.round(++complete/total*100)+'%';
     return chunk;
    }));
    for(const chunk of batch)for(const row of chunk)rows.push(row);
    await new Promise(resolve=>setTimeout(resolve,0));
   }
   window[pack.global]=data;
  }
  const script=document.createElement('script');script.src='app.js';
  script.onerror=()=>{status.textContent='编辑器加载失败，请刷新重试'};
  document.body.append(script);
 }catch(error){status.textContent=error.message;console.error(error)}
})();
