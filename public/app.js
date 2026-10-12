'use strict';
const $=s=>document.querySelector(s), NS='http://www.w3.org/2000/svg', KEY='atlas-studio-v1';
const project=([lon,lat])=>[lon*10,900-lat*10], unproject=([x,y])=>[x/10,(900-y)/10];
if(typeof EASTASIA_SUBDIVISIONS!=='undefined'){
 const ids=new Set(EASTASIA1640.regions.map(r=>r.id));
 EASTASIA1640.regions.push(...EASTASIA_SUBDIVISIONS.regions.filter(r=>!ids.has(r.id)));
 EASTASIA1640.foreign_blocks_revision=EASTASIA_SUBDIVISIONS.revision;
}
if(typeof SOUTHEAST_SUBDIVISIONS!=='undefined'){
 const ids=new Set([...EASTASIA1640.regions,...EASTASIA1640.points].map(o=>o.id));
 EASTASIA1640.regions.push(...SOUTHEAST_SUBDIVISIONS.regions.filter(r=>!ids.has(r.id)));
 EASTASIA1640.southeast_blocks_revision=SOUTHEAST_SUBDIVISIONS.revision;
 if(SOUTHEAST_SUBDIVISIONS.revision>0)EASTASIA1640.southeast_blocks_source_metadata=southeastSourceMetadata();
}
if(typeof MONGOL_SUBDIVISIONS!=='undefined'){
 const ids=new Set([...EASTASIA1640.regions,...EASTASIA1640.points].map(o=>o.id)),fids=new Set(EASTASIA1640.factions.map(f=>f.id));
 EASTASIA1640.factions.push(...MONGOL_SUBDIVISIONS.factions.filter(f=>!fids.has(f.id)));
 EASTASIA1640.regions.push(...MONGOL_SUBDIVISIONS.regions.filter(r=>!ids.has(r.id)));
 EASTASIA1640.points.push(...MONGOL_SUBDIVISIONS.points.filter(p=>!ids.has(p.id)));
 EASTASIA1640.mongol_blocks_revision=MONGOL_SUBDIVISIONS.revision;
 if(MONGOL_SUBDIVISIONS.revision>0)EASTASIA1640.mongol_blocks_source_metadata=MONGOL_SUBDIVISIONS.source_metadata;
}
if(typeof SOUTHASIA_SUBDIVISIONS!=='undefined'){
 const ids=new Set([...EASTASIA1640.regions,...EASTASIA1640.points].map(o=>o.id));
 EASTASIA1640.regions.push(...SOUTHASIA_SUBDIVISIONS.regions.filter(r=>!ids.has(r.id)));
 EASTASIA1640.southasia_blocks_revision=SOUTHASIA_SUBDIVISIONS.revision;
 if(SOUTHASIA_SUBDIVISIONS.revision>0)EASTASIA1640.southasia_blocks_source_metadata=southasiaSourceMetadata();
}
if(typeof CENTRALASIA_SUBDIVISIONS!=='undefined'){
 const ids=new Set([...EASTASIA1640.regions,...EASTASIA1640.points].map(o=>o.id));
 EASTASIA1640.regions.push(...CENTRALASIA_SUBDIVISIONS.regions.filter(r=>!ids.has(r.id)));
 EASTASIA1640.centralasia_blocks_revision=CENTRALASIA_SUBDIVISIONS.revision;
 if(CENTRALASIA_SUBDIVISIONS.revision>0)EASTASIA1640.centralasia_blocks_source_metadata=centralasiaSourceMetadata();
}
if(typeof RUSSIA_SUBDIVISIONS!=='undefined'){
 const ids=new Set([...EASTASIA1640.regions,...EASTASIA1640.points].map(o=>o.id));
 EASTASIA1640.regions.push(...RUSSIA_SUBDIVISIONS.regions.filter(r=>!ids.has(r.id)));
 EASTASIA1640.russia_blocks_revision=RUSSIA_SUBDIVISIONS.revision;
 if(RUSSIA_SUBDIVISIONS.revision>0)EASTASIA1640.russia_blocks_source_metadata=russiaSourceMetadata();
}
if(typeof MIDDLEEAST_SUBDIVISIONS!=='undefined'){
 const ids=new Set([...EASTASIA1640.regions,...EASTASIA1640.points].map(o=>o.id));
 EASTASIA1640.regions.push(...MIDDLEEAST_SUBDIVISIONS.regions.filter(r=>!ids.has(r.id)));
 EASTASIA1640.middleeast_blocks_revision=MIDDLEEAST_SUBDIVISIONS.revision;
 if(MIDDLEEAST_SUBDIVISIONS.revision>0)EASTASIA1640.middleeast_blocks_source_metadata=middleeastSourceMetadata();
}
if(typeof EUROPE_SUBDIVISIONS!=='undefined'){
 const ids=new Set([...EASTASIA1640.regions,...EASTASIA1640.points].map(o=>o.id));
 EASTASIA1640.regions.push(...EUROPE_SUBDIVISIONS.regions.filter(r=>!ids.has(r.id)));
 EASTASIA1640.europe_blocks_revision=EUROPE_SUBDIVISIONS.revision;
 if(EUROPE_SUBDIVISIONS.revision>0)EASTASIA1640.europe_blocks_source_metadata=europeSourceMetadata();
}
if(typeof AFRICA_SUBDIVISIONS!=='undefined'){
 const ids=new Set([...EASTASIA1640.regions,...EASTASIA1640.points].map(o=>o.id));
 EASTASIA1640.regions.push(...AFRICA_SUBDIVISIONS.regions.filter(r=>!ids.has(r.id)));
 EASTASIA1640.africa_blocks_revision=AFRICA_SUBDIVISIONS.revision;
 if(AFRICA_SUBDIVISIONS.revision>0)EASTASIA1640.africa_blocks_source_metadata=africaSourceMetadata();
}
if(typeof AMERICAS_SUBDIVISIONS!=='undefined'){
 const ids=new Set([...EASTASIA1640.regions,...EASTASIA1640.points].map(o=>o.id));
 EASTASIA1640.regions.push(...AMERICAS_SUBDIVISIONS.regions.filter(r=>!ids.has(r.id)));
 EASTASIA1640.americas_blocks_revision=AMERICAS_SUBDIVISIONS.revision;
 if(AMERICAS_SUBDIVISIONS.revision>0)EASTASIA1640.americas_blocks_source_metadata=americasSourceMetadata();
}
if(typeof OCEANIA_SUBDIVISIONS!=='undefined'){
 const ids=new Set([...EASTASIA1640.regions,...EASTASIA1640.points].map(o=>o.id));
 EASTASIA1640.regions.push(...OCEANIA_SUBDIVISIONS.regions.filter(r=>!ids.has(r.id)));
 EASTASIA1640.oceania_blocks_revision=OCEANIA_SUBDIVISIONS.revision;
 if(OCEANIA_SUBDIVISIONS.revision>0)EASTASIA1640.oceania_blocks_source_metadata=oceaniaSourceMetadata();
}
ATLAS_SAMPLES.push(COUNTY_SAMPLE,EASTASIA1640);
let pathCache=new WeakMap();
const boundsCache=new WeakMap();
let panRenderTimer=0;
function regionInView(g){
 let b=boundsCache.get(g);
 if(!b){b=[Infinity,Infinity,-Infinity,-Infinity];const ps=g.type==='Polygon'?[g.coordinates]:g.coordinates;for(const p of ps)for(const ring of p)for(const [lon,lat] of ring){const x=lon*10,y=900-lat*10;b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y)}boundsCache.set(g,b)}
 return b[0]<=view[0]+view[2]&&b[2]>=view[0]&&b[1]<=view[1]+view[3]&&b[3]>=view[1];
}
// Decode only active geometry; the bounded cache never owns the global dataset.
const coordinateCache=new Map();
function hydrateGeometry(g){
 if(!g.__atlas_coordinates&&!g.__atlas_binary)return;
 let encoded=g.__atlas_coordinates,binary=null,rings=g.__atlas_rings;
 if(g.__atlas_binary){const raw=atob(g.__atlas_binary),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);binary=new DataView(bytes.buffer)}
 const [w,s,e,n]=g.__atlas_bounds;
 boundsCache.set(g,[w*10,900-n*10,e*10,900-s*10]);
 delete g.__atlas_coordinates;delete g.__atlas_binary;delete g.__atlas_rings;delete g.__atlas_bounds;
 Object.defineProperty(g,'coordinates',{enumerable:true,configurable:true,get(){
  if(coordinateCache.has(g)){const value=coordinateCache.get(g);coordinateCache.delete(g);coordinateCache.set(g,value);return value}
  let value;
  if(binary){let offset=0;const polys=rings.map(poly=>poly.map(count=>Array.from({length:count},()=>{const point=[binary.getFloat64(offset,true),binary.getFloat64(offset+8,true)];offset+=16;return point})));value=g.type==='Polygon'?polys[0]:polys}else value=JSON.parse(encoded);
  coordinateCache.set(g,value);
  if(coordinateCache.size>64)coordinateCache.delete(coordinateCache.keys().next().value);
  return value;
 }});
}
for(const sample of ATLAS_SAMPLES)for(const r of sample.regions)hydrateGeometry(r.geometry);
const nameFields=['historical_name','modern_name','aliases'];
const nameConfidence=['待考证','待核验','大致可信','已核验'];
const legacyLabels={'state-ming':'明','state-qing':'清（入关前）','state-joseon':'朝鲜','state-japan':'日本·德川','area-ainu':'阿伊努','area-taiwan':'台湾','area-tibet':'藏地·待细分','state-russia':'沙皇俄国','state-ryukyu':'琉球','area-amami':'奄美'};
const sampleObjects=new Map(ATLAS_SAMPLES.map(s=>[s.sample_id,new Map([...s.regions,...s.points].map(o=>[o.id,o]))]));
let labelMode='historical',southeastCountry='',southasiaCountry='',centralasiaCountry='',russiaArea='',middleeastCountry='',middleeastOverview=false,europeCountry='',europeOverview=false,africaCountry='',africaOverview=false,americasCountry='',americasOverview=false,oceaniaCountry='',oceaniaOverview=false,northArea='';
try{const savedMode=localStorage.getItem(KEY+'-label-mode');if(['historical','compare','modern'].includes(savedMode))labelMode=savedMode}catch(e){console.warn('地名显示偏好未加载',e)}
function validateNames(o){
 for(const key of ['historical_name','modern_name','name_source'])if(Object.hasOwn(o,key)&&typeof o[key]!=='string')throw Error('地名字段必须是文字：'+key);
 if(Object.hasOwn(o,'aliases')&&(!Array.isArray(o.aliases)||o.aliases.some(a=>typeof a!=='string')))throw Error('地名别名必须是文字数组');
 if(Object.hasOwn(o,'name_confidence')&&!nameConfidence.includes(o.name_confidence))throw Error('地名可信程度无效');
}
function migrateNames(s){
 const originals=sampleObjects.get(s.sample_id);
 for(const o of [...s.regions,...s.points]){
  validateNames(o);
  const original=originals?.get(o.id),modern=o.unit_type==='modern_county';
  if(!Object.hasOwn(o,'modern_name'))o.modern_name=modern?(o.modern_county||original?.modern_county||original?.name||o.name):'';
  if(!Object.hasOwn(o,'historical_name')){
   if(modern)o.historical_name=o.name&&o.name!==(original?.name||o.modern_county||o.modern_name)?o.name:'';
   else o.historical_name=original&&o.name===original.name?(o.map_label||legacyLabels[o.id]||o.name):o.name;
  }
  if(!Object.hasOwn(o,'aliases'))o.aliases=[];
  if(!Object.hasOwn(o,'name_source'))o.name_source='';
  if(!Object.hasOwn(o,'name_confidence'))o.name_confidence=o.historical_name?'待核验':'待考证';
 }
}
function applyNameValues(o,values){
 validateNames(values);
 const next={...values};
 for(const key of ['name','historical_name','modern_name','name_source'])if(typeof next[key]==='string')next[key]=next[key].trim();
 if(next.aliases)next.aliases=[...new Set(next.aliases.map(a=>a.trim()).filter(Boolean))];
 // The old name command remains an explicit rename, even when a map_label exists.
 if(Object.hasOwn(next,'name')&&!Object.hasOwn(next,'historical_name'))next.historical_name=next.name;
 Object.assign(o,next);
 if(Object.hasOwn(next,'historical_name')&&next.historical_name)o.name=next.historical_name;
}
function objectName(o,display='compare'){
 const historical=o.historical_name?.trim(),modern=o.modern_name?.trim();
 if(display==='modern')return modern?'今'+modern:(historical?historical+'（今名未录）':'今名未录');
 const primary=historical||'历史名待考';
 return modern&&(display==='compare'||!historical)?primary+'｜今'+modern:primary;
}
function nameSearch(o){return [o.historical_name,o.modern_name,...o.aliases,o.name,o.map_label,o.province,o.prefecture,o.county,o.command,o.wei,o.suo,o.modern_country,o.source_region_code,o.modern_province,o.modern_prefecture,o.modern_county].join(' ').toLowerCase()}
function migrateForeignBlocks(s){
 return typeof EASTASIA_SUBDIVISIONS!=='undefined'&&migrateSubdivisionPack(s,EASTASIA_SUBDIVISIONS,'foreign_blocks_revision');
}
function migrateSoutheastBlocks(s){
 const added=typeof SOUTHEAST_SUBDIVISIONS!=='undefined'&&migrateSubdivisionPack(s,SOUTHEAST_SUBDIVISIONS,'southeast_blocks_revision');
 if(added&&!s.southeast_blocks_source_metadata)s.southeast_blocks_source_metadata=southeastSourceMetadata();
 return added;
}
function migrateSouthasiaBlocks(s){
 const added=typeof SOUTHASIA_SUBDIVISIONS!=='undefined'&&migrateSubdivisionPack(s,SOUTHASIA_SUBDIVISIONS,'southasia_blocks_revision');
 if(added&&!s.southasia_blocks_source_metadata)s.southasia_blocks_source_metadata=southasiaSourceMetadata();
 return added;
}
function southasiaSourceMetadata(){
 const p=SOUTHASIA_SUBDIVISIONS;
 return {revision:p.revision,database_license:p.database_license||'',database_license_url:p.database_license_url||'',attribution:p.attribution||'',sources:p.source_metadata||{}};
}
function migrateCentralasiaBlocks(s){
 const added=typeof CENTRALASIA_SUBDIVISIONS!=='undefined'&&migrateSubdivisionPack(s,CENTRALASIA_SUBDIVISIONS,'centralasia_blocks_revision');
 if(added&&!s.centralasia_blocks_source_metadata)s.centralasia_blocks_source_metadata=centralasiaSourceMetadata();
 return added;
}
function centralasiaSourceMetadata(){
 const p=CENTRALASIA_SUBDIVISIONS;
 return {revision:p.revision,database_license:p.database_license||'',database_license_url:p.database_license_url||'',attribution:p.attribution||'',sources:p.source_metadata||{}};
}
function migrateMiddleeastBlocks(s){
 const added=typeof MIDDLEEAST_SUBDIVISIONS!=='undefined'&&migrateSubdivisionPack(s,MIDDLEEAST_SUBDIVISIONS,'middleeast_blocks_revision');
 if(added&&!s.middleeast_blocks_source_metadata)s.middleeast_blocks_source_metadata=middleeastSourceMetadata();
 return added;
}
function middleeastSourceMetadata(){
 const p=MIDDLEEAST_SUBDIVISIONS;
 return {revision:p.revision,database_license:p.database_license||'',database_license_url:p.database_license_url||'',attribution:p.attribution||'',sources:p.source_metadata||{}};
}
function migrateEuropeBlocks(s){
 const added=typeof EUROPE_SUBDIVISIONS!=='undefined'&&migrateSubdivisionPack(s,EUROPE_SUBDIVISIONS,'europe_blocks_revision');
 if(added&&!s.europe_blocks_source_metadata)s.europe_blocks_source_metadata=europeSourceMetadata();
 return added;
}
function europeSourceMetadata(){
 const p=EUROPE_SUBDIVISIONS;
 return {revision:p.revision,database_license:p.database_license||'',database_license_url:p.database_license_url||'',attribution:p.attribution||'',sources:p.source_metadata||{}};
}
function migrateAfricaBlocks(s){
 const added=typeof AFRICA_SUBDIVISIONS!=='undefined'&&migrateSubdivisionPack(s,AFRICA_SUBDIVISIONS,'africa_blocks_revision');
 if(added&&!s.africa_blocks_source_metadata)s.africa_blocks_source_metadata=africaSourceMetadata();
 return added;
}
function africaSourceMetadata(){
 const p=AFRICA_SUBDIVISIONS;
 return {revision:p.revision,database_license:p.database_license||'',database_license_url:p.database_license_url||'',attribution:p.attribution||'',sources:p.source_metadata||{}};
}
function migrateAmericasBlocks(s){
 const added=typeof AMERICAS_SUBDIVISIONS!=='undefined'&&migrateSubdivisionPack(s,AMERICAS_SUBDIVISIONS,'americas_blocks_revision');
 if(added&&!s.americas_blocks_source_metadata)s.americas_blocks_source_metadata=americasSourceMetadata();
 return added;
}
function americasSourceMetadata(){
 const p=AMERICAS_SUBDIVISIONS;
 return {revision:p.revision,database_license:p.database_license||'',database_license_url:p.database_license_url||'',attribution:p.attribution||'',sources:p.source_metadata||{}};
}
function migrateOceaniaBlocks(s){
 const added=typeof OCEANIA_SUBDIVISIONS!=='undefined'&&migrateSubdivisionPack(s,OCEANIA_SUBDIVISIONS,'oceania_blocks_revision');
 if(added&&!s.oceania_blocks_source_metadata)s.oceania_blocks_source_metadata=oceaniaSourceMetadata();
 return added;
}
function oceaniaSourceMetadata(){
 const p=OCEANIA_SUBDIVISIONS;
 return {revision:p.revision,database_license:p.database_license||'',database_license_url:p.database_license_url||'',attribution:p.attribution||'',sources:p.source_metadata||{}};
}
function migrateRussiaBlocks(s){
 const added=typeof RUSSIA_SUBDIVISIONS!=='undefined'&&migrateSubdivisionPack(s,RUSSIA_SUBDIVISIONS,'russia_blocks_revision');
 if(added&&!s.russia_blocks_source_metadata)s.russia_blocks_source_metadata=russiaSourceMetadata();
 return added;
}
function russiaSourceMetadata(){
 const p=RUSSIA_SUBDIVISIONS;
 return {revision:p.revision,database_license:p.database_license||'',database_license_url:p.database_license_url||'',attribution:p.attribution||'',sources:p.source_metadata||{}};
}
function migrateMongolBlocks(s){
 if(typeof MONGOL_SUBDIVISIONS==='undefined'||s.sample_id!=='eastasia1640'||(s.mongol_blocks_revision||0)>=MONGOL_SUBDIVISIONS.revision)return false;
 const p=MONGOL_SUBDIVISIONS,ids=new Set([...s.regions,...s.points].map(o=>o.id)),missing=[...p.regions,...p.points].filter(o=>!ids.has(o.id));
 const needed=new Set(missing.flatMap(o=>[o.owner,o.controller])),fids=new Set(s.factions.map(f=>f.id));
 for(const f of [...p.factions,...EASTASIA1640.factions])if(needed.has(f.id)&&!fids.has(f.id)){s.factions.push(structuredClone(f));fids.add(f.id)}
 for(const r of p.regions)if(!ids.has(r.id)){s.regions.push(structuredClone(r));ids.add(r.id)}
 for(const point of p.points)if(!ids.has(point.id)){s.points.push(structuredClone(point));ids.add(point.id)}
 s.mongol_blocks_revision=p.revision;
 if(!s.mongol_blocks_source_metadata)s.mongol_blocks_source_metadata=structuredClone(p.source_metadata);
 return true;
}
function southeastSourceMetadata(){
 const p=SOUTHEAST_SUBDIVISIONS;
 return {revision:p.revision,database_license:p.database_license||'',database_license_url:p.database_license_url||'',attribution:p.attribution||'',sources:p.source_metadata||{}};
}
function migrateSubdivisionPack(s,pack,revisionKey){
 if(s.sample_id!=='eastasia1640'||(s[revisionKey]||0)>=pack.revision)return false;
 const existing=new Map(s.regions.map(r=>[r.id,r])),ids=new Set([...s.regions,...s.points].map(o=>o.id)),base=sampleObjects.get('eastasia1640'),factions=new Set(s.factions.map(f=>f.id));
 for(const original of pack.regions){
  if(ids.has(original.id))continue;
  const block=cloneRegion(original),parent=existing.get(block.parent_id),baseline=base.get(block.parent_id);
  for(const key of ['owner','controller']){
   if(parent&&baseline&&parent[key]!==baseline[key])block[key]=parent[key];
   if(!factions.has(block[key])){const f=EASTASIA1640.factions.find(f=>f.id===block[key]);if(f){s.factions.push(structuredClone(f));factions.add(f.id)}}
  }
  // An explicitly deleted historical reference face is not resurrected by subdivision migration.
  if(block.parent_id&&!existing.has(block.parent_id))block.parent_id='';
  s.regions.push(block);ids.add(block.id);
 }
 s[revisionKey]=pack.revision;
 return true;
}
const blankProps={province:'',prefecture:'',county:'',command:'',wei:'',suo:'',source:'',notes:'',confidence:'示例',status:'待考证',owner:'ming',controller:'ming'};
const region=(id,name,coords,owner='ming')=>({id,name,geometry:{type:'Polygon',coordinates:[coords.concat([coords[0]])]},...blankProps,owner,controller:owner,source:'操作示例：手绘概略范围，未经史料考证。'});
const seed={format:'historical-atlas-scenario',version:1,title:'1640 · 明末开局工作稿',year:1640,factions:[{id:'ming',name:'明',color:'#bd975d'},{id:'qing',name:'清',color:'#9e6355'},{id:'rebel',name:'起义军',color:'#748663'},{id:'unknown',name:'待定',color:'#9ba5a0'}],regions:[region('demo-beijing','京畿 · 示例',[[114.5,38],[118,38],[119,40],[117.5,41],[114.5,40]]),region('demo-liaoxi','辽西 · 示例',[[119,40],[120,39.8],[122,41.2],[121,42],[119.4,41.3]]),region('demo-liaodong','辽东 · 示例',[[122,40],[124,39.5],[126,41.5],[125,44],[122,43],[121,42]],'qing'),region('demo-henan','河南 · 示例',[[110.5,32],[114,32],[116,34],[114.5,36],[111,35]])],points:[{id:'point-beijing',name:'北京',coordinates:[116.4,39.9],kind:'城池',...blankProps,source:'位置为现代城市坐标参照；历史城址待校核。'},{id:'point-jinzhou',name:'锦州',coordinates:[121.14,41.1],kind:'卫城',...blankProps,wei:'锦州卫',source:'名称与位置为编辑示例，隶属及1640控制状态待逐项校核。'}],reference:null};
// Geometry is shared by snapshots; vertex editing copies its target before mutation.
function cloneRegion({geometry,...attributes}){return {...structuredClone(attributes),geometry}}
function cloneScenario(s){
 const {regions=[],...meta}=s;
 const result=structuredClone(meta);
 result.regions=regions.map(cloneRegion);
 return result;
}
let state=cloneScenario(EASTASIA1640), selected=new Set(), tool='select', activeFaction='ming', mode='owner', draft=[], history=[], future=[], view=[950,340,530,470], drag=null, timer;
function decodeSaved(s){
 if(s.format!=='atlas-workspace')return s;
 const base=ATLAS_SAMPLES.find(b=>b.sample_id===s.sample);if(!base)throw Error('缺少原始样本');
 const restored=cloneScenario(base);Object.assign(restored,s.meta);
 restored.southeast_revision=s.meta.southeast_revision||0;restored.liaodong_revision=s.meta.liaodong_revision||0;restored.foreign_blocks_revision=s.meta.foreign_blocks_revision||0;restored.southeast_blocks_revision=s.meta.southeast_blocks_revision||0;restored.mongol_blocks_revision=s.meta.mongol_blocks_revision||0;if(Object.hasOwn(s.meta,'southasia_blocks_revision'))restored.southasia_blocks_revision=s.meta.southasia_blocks_revision;else delete restored.southasia_blocks_revision;if(Object.hasOwn(s.meta,'centralasia_blocks_revision'))restored.centralasia_blocks_revision=s.meta.centralasia_blocks_revision;else delete restored.centralasia_blocks_revision;if(Object.hasOwn(s.meta,'middleeast_blocks_revision'))restored.middleeast_blocks_revision=s.meta.middleeast_blocks_revision;else delete restored.middleeast_blocks_revision;if(Object.hasOwn(s.meta,'europe_blocks_revision'))restored.europe_blocks_revision=s.meta.europe_blocks_revision;else delete restored.europe_blocks_revision;if(Object.hasOwn(s.meta,'africa_blocks_revision'))restored.africa_blocks_revision=s.meta.africa_blocks_revision;else delete restored.africa_blocks_revision;if(Object.hasOwn(s.meta,'americas_blocks_revision'))restored.americas_blocks_revision=s.meta.americas_blocks_revision;else delete restored.americas_blocks_revision;if(Object.hasOwn(s.meta,'oceania_blocks_revision'))restored.oceania_blocks_revision=s.meta.oceania_blocks_revision;else delete restored.oceania_blocks_revision;if(Object.hasOwn(s.meta,'russia_blocks_revision'))restored.russia_blocks_revision=s.meta.russia_blocks_revision;else delete restored.russia_blocks_revision;
 const prior=restored.liaodong_revision<(base.liaodong_revision||0)?new Map((base.liaodong_migration?.groups||[]).flatMap(g=>g.before.map(r=>[r.id,r]))):new Map();
 const byId=new Map(base.regions.map(r=>[r.id,r]));
 restored.regions=s.regions.map(r=>{
  const original=prior.get(r.id)||byId.get(r.id);
  const result={...(s.attribute_deltas===1?cloneRegion(original||{}):{}),...r,geometry:r.geometry||original?.geometry};
  for(const key of s.removed_region_fields?.[r.id]||[])delete result[key];
  return result;
 });return restored;
}
function migrateLiaodong(s){
 const revision=EASTASIA1640.liaodong_revision||0,migration=EASTASIA1640.liaodong_migration;
 if(s.sample_id!=='eastasia1640'||!migration||(s.liaodong_revision||0)>=revision)return false;
 const updated=new Map(EASTASIA1640.regions.map(r=>[r.id,r]));
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const merge=(current,previous,replacement)=>{
  const result=structuredClone(replacement);
  for(const key of new Set([...Object.keys(previous),...Object.keys(current)])){
   if(key==='id'||key==='geometry')continue;
   if(!same(current[key],previous[key])){if(Object.hasOwn(current,key))result[key]=structuredClone(current[key]);else delete result[key]}
  }
  return result;
 };
 for(const group of migration.groups){
  const before=new Map(group.before.map(r=>[r.id,r])),current=new Map(s.regions.filter(r=>before.has(r.id)).map(r=>[r.id,r]));
  const customGeometry=[...current].some(([id,r])=>!same(r.geometry,before.get(id).geometry));
  const inherited=new Set(group.after_ids.map(id=>group.inherit_from?.[id]||(before.has(id)?id:undefined)));
  const editedOrphan=[...current].some(([id,r])=>!inherited.has(id)&&[...new Set([...Object.keys(before.get(id)),...Object.keys(r)])].some(key=>key!=='id'&&key!=='geometry'&&!same(r[key],before.get(id)[key])));
  if(customGeometry||editedOrphan){
   // Preserve hand-drawn outlines and edited blocks without a successor; new pieces could overlap them.
   continue;
  }
  const replacements=[];
  for(const id of group.after_ids){
   const replacement=updated.get(id);if(!replacement)throw Error('辽东修订缺少地区：'+id);
   if(!before.size){if(!s.regions.some(r=>r.id===id))replacements.push(structuredClone(replacement));continue}
   const previousId=group.inherit_from?.[id]||(before.has(id)?id:undefined),previous=before.get(previousId),existing=current.get(previousId);
   // Deleting a source block is an edit too; do not resurrect it or its new fragments.
   if(previous&&existing)replacements.push(merge(existing,previous,replacement));
  }
  const insertion=s.regions.findIndex(r=>before.has(r.id));
  s.regions=s.regions.filter(r=>!before.has(r.id));
  s.regions.splice(insertion<0?s.regions.length:insertion,0,...replacements);
 }
 if(s.dataset_notes===migration.before_metadata?.dataset_notes)s.dataset_notes=EASTASIA1640.dataset_notes;
 s.liaodong_revision=revision;
 return true;
}
try{const saved=localStorage.getItem(KEY);if(saved){const s=decodeSaved(JSON.parse(saved));validate(s);state=s}}catch(e){console.warn('本地存档未加载',e)}

let switchedToCounties=false;
if(new URLSearchParams(location.search).get('counties')==='1'&&state.sample_id!=='county-blocks'&&state.sample_id!=='eastasia1640'){
 try{const saved=localStorage.getItem(KEY);if(saved)localStorage.setItem(KEY+'-pre-county-backup',saved);state=cloneScenario(COUNTY_SAMPLE);switchedToCounties=true}catch(e){console.warn('切换分块失败，保留原稿',e)}
}

let introduced1640=false,showCountyBlocks=true;
try{if(localStorage.getItem(KEY+'-1640-revision')!=='1'){const old=localStorage.getItem(KEY);if(old)localStorage.setItem(KEY+'-pre1640-backup',old);if(!old)state=cloneScenario(EASTASIA1640);introduced1640=true}}catch(e){console.warn('1640迁移未完成，原稿保留',e)}
// Newly recovered coastal blocks are added without replacing edited attributes or custom geometry.
if(state.sample_id==='eastasia1640'&&!state.coastal_revision){const ids=new Set(state.regions.map(r=>r.id));for(const r of EASTASIA1640.regions)if(r.coastal_added&&!ids.has(r.id))state.regions.push(structuredClone(r));state.coastal_revision=1}
if(state.sample_id==='eastasia1640'&&!state.southeast_revision){
 const ids=new Set([...state.regions,...state.points].map(o=>o.id)),fs=new Set(state.factions.map(f=>f.id));
 for(const f of EASTASIA1640.factions)if(!fs.has(f.id))state.factions.push(structuredClone(f));
 for(const r of EASTASIA1640.regions)if(r.theater==='southeast_asia'&&r.unit_type!=='modern_county'&&!ids.has(r.id))state.regions.push(structuredClone(r));
 for(const p of EASTASIA1640.points)if(p.theater==='southeast_asia'&&!ids.has(p.id))state.points.push(structuredClone(p));
 state.southeast_revision=1;
}
let repairedLiaodong=false;
try{if(state.sample_id==='eastasia1640'&&(state.liaodong_revision||0)<(EASTASIA1640.liaodong_revision||0)){
 const old=localStorage.getItem(KEY);
 if(old&&!localStorage.getItem(KEY+'-pre-liaodong-backup'))localStorage.setItem(KEY+'-pre-liaodong-backup',old);
 const repaired=cloneScenario(state);if(migrateLiaodong(repaired)){validate(repaired);state=repaired;repairedLiaodong=true}
}}catch(e){console.warn('辽东修订未完成，原稿保留',e)}
const introducedForeignBlocks=migrateForeignBlocks(state);
const introducedSoutheastBlocks=migrateSoutheastBlocks(state);
const introducedMongolBlocks=migrateMongolBlocks(state);
const introducedSouthasiaBlocks=migrateSouthasiaBlocks(state);
const introducedCentralasiaBlocks=migrateCentralasiaBlocks(state);
const introducedRussiaBlocks=migrateRussiaBlocks(state);
const introducedMiddleeastBlocks=migrateMiddleeastBlocks(state);
const introducedEuropeBlocks=migrateEuropeBlocks(state);
const introducedAfricaBlocks=migrateAfricaBlocks(state);
const introducedAmericasBlocks=migrateAmericasBlocks(state);
const introducedOceaniaBlocks=migrateOceaniaBlocks(state);
migrateNames(state);
if(state.sample_id==='eastasia1640')view=[850,220,700,520];
function validate(s){if(!s||s.format!=='historical-atlas-scenario'||s.version!==1||!Array.isArray(s.factions)||!Array.isArray(s.regions)||!Array.isArray(s.points))throw Error('不是受支持的舆图剧本');if(!Number.isInteger(s.year)||s.year< -3000||s.year>3000||typeof s.title!=='string')throw Error('剧本年份或名称无效');let ids=new Set();for(const f of s.factions){if(!f.id||ids.has(f.id)||typeof f.name!=='string'||!/^#[\da-f]{6}$/i.test(f.color))throw Error('势力编号或颜色无效');ids.add(f.id)}const objects=new Set();const checkPoint=p=>Array.isArray(p)&&p.length>=2&&p.slice(0,2).every(Number.isFinite)&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90;for(const o of [...s.regions,...s.points]){if(!o.id||objects.has(o.id)||typeof o.name!=='string'||!ids.has(o.owner)||!ids.has(o.controller))throw Error('对象编号、名称或势力引用无效');validateNames(o);objects.add(o.id)}for(const r of s.regions){if(!['Polygon','MultiPolygon'].includes(r.geometry?.type))throw Error('只支持 Polygon / MultiPolygon');const polys=r.geometry.type==='Polygon'?[r.geometry.coordinates]:r.geometry.coordinates;if(!Array.isArray(polys)||!polys.length)throw Error('地区轮廓为空');for(const p of polys){if(!Array.isArray(p)||!p.length)throw Error('地区轮廓无效');for(const ring of p){if(!Array.isArray(ring)||ring.length<4||!ring.every(checkPoint)||JSON.stringify(ring[0])!==JSON.stringify(ring.at(-1)))throw Error('轮廓需要至少三个点并闭合')}}}for(const p of s.points)if(!checkPoint(p.coordinates))throw Error('据点坐标无效');if(s.reference){const r=s.reference;if(typeof r.url!=='string'||!/^data:image\/(png|jpeg|webp);base64,/.test(r.url)||!Array.isArray(r.bounds)||r.bounds.length!==4||!r.bounds.every(Number.isFinite)||r.bounds[0]>=r.bounds[2]||r.bounds[1]>=r.bounds[3]||r.bounds[0]<-180||r.bounds[2]>180||r.bounds[1]<-90||r.bounds[3]>90||!Number.isFinite(r.opacity)||r.opacity<0||r.opacity>1)throw Error('参考图片或经纬度范围无效')}}
function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';clearTimeout(timer);timer=setTimeout(()=>$('#toast').style.display='none',3500)}
function persist(){try{
 let saved=state;const base=ATLAS_SAMPLES.find(b=>b.sample_id===state.sample_id);
 if(base){
  const byId=new Map(base.regions.map(r=>[r.id,r])),removed_region_fields={};
  const meta={...state};delete meta.regions;delete meta.liaodong_migration;
  const regions=state.regions.map(r=>{
   const original=byId.get(r.id);if(!original)return r;
   const delta={id:r.id};
   for(const key of Object.keys(r))if(key!=='id'&&r[key]!==original[key]&&JSON.stringify(r[key])!==JSON.stringify(original[key]))delta[key]=r[key];
   const removed=Object.keys(original).filter(key=>!Object.hasOwn(r,key));
   if(removed.length)removed_region_fields[r.id]=removed;
   return delta;
  });
  saved={format:'atlas-workspace',sample:state.sample_id,attribute_deltas:1,meta,regions,removed_region_fields};
 }
 localStorage.setItem(KEY,JSON.stringify(saved));$('#saveState').textContent='已自动保存 · '+new Date().toLocaleTimeString('zh-CN');return true;
 }catch(e){$('#saveState').textContent='自动保存失败，请导出';toast('浏览器存储不足，请导出剧本保存');return false}}

function mutate(fn){const before=cloneScenario(state);try{fn();migrateForeignBlocks(state);migrateSoutheastBlocks(state);migrateMongolBlocks(state);migrateSouthasiaBlocks(state);migrateCentralasiaBlocks(state);migrateRussiaBlocks(state);migrateMiddleeastBlocks(state);migrateEuropeBlocks(state);migrateAfricaBlocks(state);migrateAmericasBlocks(state);migrateOceaniaBlocks(state);migrateNames(state);validate(state);history.push(before);if(history.length>8)history.shift();future=[];persist();render()}catch(e){state=before;render();toast(e.message)}}
function node(tag,attrs={},text){const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n}
function pathGeometry(g){if(pathCache.has(g))return pathCache.get(g);const ps=g.type==='Polygon'?[g.coordinates]:g.coordinates;const result=ps.map(p=>p.map(r=>'M'+r.map(c=>project(c).join(',')).join('L')+'Z').join('')).join('');pathCache.set(g,result);return result}
function objects(){return [...state.regions,...state.points]}function chosen(){return objects().filter(o=>selected.has(o.id))}function faction(id){return state.factions.find(f=>f.id===id)}function uid(prefix){return prefix+'-'+crypto.randomUUID()}
function setView(v){if(v.some((n,i)=>n!==view[i]))pathCache=new WeakMap();view=v;$('#map').setAttribute('viewBox',v.join(' '));if(drag?.kind==='pan'&&!panRenderTimer)panRenderTimer=setTimeout(()=>{panRenderTimer=0;render()},120)}function updateDraft(){const g=$('#draft');g.replaceChildren();if(draft.length){g.append(node('polyline',{points:draft.map(c=>project(c).join(',')).join(' '),fill:'#c0a87555',stroke:'#325c4e','stroke-width':1}));draft.forEach(c=>{const[x,y]=project(c);g.append(node('circle',{cx:x,cy:y,r:view[2]/250,fill:'#325c4e'}))})}}
function regionLabelVisible(r,coords,labelSize){
 if(r.unit_type!=='modern_county'||selected.has(r.id))return true;
 if(view[2]>=25)return false;
 const [x,y]=project(r.center||coords[0]);
 if(x<view[0]||x>view[0]+view[2]||y<view[1]||y>view[1]+view[3])return false;
 const bounds=coords.reduce((b,c)=>[Math.min(b[0],c[0]),Math.min(b[1],c[1]),Math.max(b[2],c[0]),Math.max(b[3],c[1])],[Infinity,Infinity,-Infinity,-Infinity]);
 return (bounds[2]-bounds[0])*10>=objectName(r,labelMode).length*labelSize*.65&&(bounds[3]-bounds[1])*10>=labelSize*1.4;
}
function positionBanner(){const bar=$('.mapbar');$('#datasetBanner').style.top=Math.max(100,bar.offsetTop+bar.offsetHeight+8)+'px'}
window.addEventListener('resize',positionBanner);
function render(){ $('#labelMode').value=labelMode;$('#showCounties').checked=showCountyBlocks;$('#southeastCountry').value=southeastCountry;$('#northArea').value=northArea;$('#southasiaCountryView').value=southasiaCountry;$('#centralasiaCountryView').value=centralasiaCountry;$('#russiaAreaView').value=russiaArea;$('#middleeastCountryView').value=middleeastCountry;$('#europeCountryView').value=europeCountry;$('#africaCountryView').value=africaCountry;$('#americasCountryView').value=americasCountry;$('#oceaniaCountryView').value=oceaniaCountry;$('#map').classList.toggle('county-overview',view[2]>300&&!southeastCountry&&!southasiaCountry&&!centralasiaCountry&&!russiaArea&&!middleeastCountry&&!middleeastOverview&&!europeCountry&&!europeOverview&&!africaCountry&&!africaOverview&&!americasCountry&&!americasOverview&&!oceaniaCountry&&!oceaniaOverview&&!northArea);const labelSize=view[2]/($('#map').clientWidth||700)*12;activeFaction=faction(activeFaction)?activeFaction:state.factions[0]?.id;$('#mode').value=mode;$('#title').value=state.title;$('#year').value=state.year;$('.map-caption').firstChild.textContent=state.year+' · 开局工作稿 ';$('#datasetBanner').textContent=state.sample_id==='eastasia1640'?'1640 · 东亚、蒙古／女真、东南亚、南亚、中亚、俄罗斯、中东、欧洲、非洲、美洲与大洋洲分块 · 历史范围与现代定位分别编辑':state.sample_id==='county-blocks'?'现代县级空间分块 · 不代表明代县界或县名 · 历史属性独立编辑':'边界参考：'+(state.source_year||'自定义')+'年 · 卫所为文献定位，1640存续待核验';$('#sample').value=state.sample_id||'ming1626';$('#undo').disabled=!history.length;$('#redo').disabled=!future.length;$('#finish').disabled=tool!=='draw'||draft.length<3;document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));$('#toolHint').textContent=({paint:'选势力 → 点击或拖过分块即标记 · 一笔可撤销',brush:'拖过分块连续选择 · Shift 取消选择',select:'点击分块 → 选势力 → 划归 · Shift 多选',draw:'逐点绘制 · Enter 完成 · Esc 取消',vertex:'选择地区后拖动白色边界节点',point:'点击地图放置据点'})[tool];$('#factions').replaceChildren();for(const f of state.factions){const b=document.createElement('button');b.className='faction'+(activeFaction===f.id?' active':'');const c=document.createElement('i');c.className='swatch';c.style.background=f.color;b.append(c,document.createTextNode(f.name));b.onclick=()=>{activeFaction=f.id;render()};$('#factions').append(b)}$('#regions').replaceChildren();const focusedCountry=southasiaCountry||centralasiaCountry||middleeastCountry||europeCountry||africaCountry||americasCountry.split(':')[0]||oceaniaCountry||(russiaArea?'RUS':''),displayRegions=focusedCountry?[...state.regions.filter(r=>r.source_region_code!==focusedCountry),...state.regions.filter(r=>r.source_region_code===focusedCountry)]:state.regions;for(const r of displayRegions){if(!regionInView(r.geometry)){pathCache.delete(r.geometry);continue}if(state.sample_id==='eastasia1640'&&r.unit_type==='modern_county'&&!showCountyBlocks)continue;$('#regions').append(node('path',{d:pathGeometry(r.geometry),fill:faction(r[mode])?.color||'#aaa','fill-rule':'evenodd',class:'region'+(r.unit_type==='modern_county'?' county-block':r.unit_type==='cultural_zone'?' cultural-zone':' political-area')+(r.source_geometry_scope==='administrative_atoll_including_water'?' marine-block':'')+(selected.has(r.id)?' selected':''),'data-id':r.id,'data-theater':r.theater||'china','data-country':r.source_region_code||''}));if(r.unit_type==='modern_county'&&!selected.has(r.id)&&view[2]>=25)continue;const ring=r.geometry.type==='Polygon'?r.geometry.coordinates[0]:r.geometry.coordinates[0][0];const coords=ring.slice(0,-1);const [x,y]=project(coords.reduce((a,c)=>[a[0]+c[0]/coords.length,a[1]+c[1]/coords.length],[0,0]));if(regionLabelVisible(r,coords,labelSize)){$('#regions').append(node('text',{x:r.center?project(r.center)[0]:x,y:r.center?project(r.center)[1]:y,'text-anchor':'middle',style:'font-size:'+labelSize+'px;stroke-width:'+(labelSize/6)+'px'},objectName(r,labelMode)))}}$('#points').replaceChildren();for(const p of state.points){const[x,y]=project(p.coordinates);$('#points').append(node('circle',{cx:x,cy:y,r:labelSize/3,fill:selected.has(p.id)?'#f7f0cf':faction(p[mode])?.color||'#274f41',stroke:selected.has(p.id)?'#274f41':'#fff','stroke-width':labelSize/10,'data-id':p.id}));if(view[2]<160||selected.has(p.id)||(p.id.startsWith('mongol-')&&(!p.id.startsWith('mongol-detail-')||(view[2]<400&&northArea!=='amur')))||(p.id.startsWith('jurchen-')&&view[2]<400)||(p.theater==='southeast_asia'&&view[2]<650))$('#points').append(node('text',{x:x+labelSize/2,y:y+labelSize/4,style:'font-size:'+labelSize+'px;stroke-width:'+(labelSize/6)+'px'},objectName(p,labelMode)))}$('#ref').replaceChildren();if(state.reference){const r=state.reference,[w,s,e,n]=r.bounds,[x,y]=project([w,n]);$('#ref').append(node('image',{href:r.url,x,y,width:(e-w)*10,height:(n-s)*10,opacity:r.opacity,preserveAspectRatio:'none','pointer-events':'none'}))}$('#handles').replaceChildren();if(tool==='vertex'&&selected.size===1){const r=state.regions.find(r=>selected.has(r.id));if(r){const ps=r.geometry.type==='Polygon'?[r.geometry.coordinates]:r.geometry.coordinates;ps.forEach((p,pi)=>p.forEach((ring,ri)=>ring.slice(0,-1).forEach((c,vi)=>{const[x,y]=project(c);$('#handles').append(node('circle',{cx:x,cy:y,r:view[2]/180,class:'handle','data-region':r.id,'data-poly':pi,'data-ring':ri,'data-vertex':vi}))})))}}updateDraft();$('#count').textContent=state.regions.length+' 地区 · 已选 '+selected.size+' · '+state.points.length+' 据点';renderInspector();renderList();positionBanner()}
function renderInspector(){
 const list=chosen(),o=list[0],multiple=list.length>1;
 $('#inspector').hidden=!o;$('#empty').hidden=!!o;
 $('#selectionTitle').textContent=multiple?`已选择 ${list.length} 个对象`:o?objectName(o):'选择一处地区';
 $('#selectionSubtitle').textContent=multiple?'历史名称、现代定位名和别名保留各对象原值；其余属性批量保存。':o?(o.geometry?(o.unit_type==='modern_county'?'现代空间块：'+[...new Set([o.modern_country,o.modern_province,o.modern_prefecture,o.modern_county].filter(Boolean))].join(' / ')+(o.source_geometry_scope==='administrative_atoll_including_water'?'；现代环礁行政块含海域':'')+'；历史隶属独立填写':'地区轮廓 / 独立政治与行政属性'):'据点 / 城池、卫城或关隘'):'在地图上点击地区或据点，编辑其开局属性。';
 if(!o)return;
 $('#historicalNameLabel').firstChild.textContent=state.year+'年历史名称';
 $('#nameNotice').textContent=multiple?'逐个选择对象可编辑其地名。':!o.historical_name?'历史名待考。现代定位名用于寻找位置；历史府县、城址和疆界需分别核实。':state.year+'年开局地名 · '+o.name_confidence+(o.name_source?' · 已记录名称依据':' · 名称依据待补录');
 $('#recordDates').textContent=o.record_begin?`记录范围：${o.record_begin}—${o.record_end}。开局年份为${state.year}，存续与控制仍需核实。`:'';
 for(const name of ['owner','controller']){const el=$(`[name="${name}"]`);el.replaceChildren();for(const f of state.factions){const op=document.createElement('option');op.value=f.id;op.textContent=f.name;el.append(op)}}
 for(const el of $('#inspector').elements)if(el.name){el.value=el.name==='aliases'?o.aliases.join('；'):o[el.name]??'';el.disabled=nameFields.includes(el.name)&&multiple}
}
function renderList(){
 const q=$('#search').value.trim().toLowerCase();$('#objectList').replaceChildren();
 for(const o of objects().filter(o=>nameSearch(o).includes(q)).slice(0,100)){
  const b=document.createElement('button');b.textContent=(o.geometry?'◇ ':'⊙ ')+objectName(o);b.dataset.id=o.id;
  b.onclick=()=>{selected=new Set([o.id]);if(o.unit_type==='modern_county'){showCountyBlocks=true;$('#showCounties').checked=true}const c=o.coordinates||o.center||(o.geometry.type==='Polygon'?o.geometry.coordinates[0][0]:o.geometry.coordinates[0][0][0]);const[x,y]=project(c);setView([x-35,y-30,70,60]);render()};
  $('#objectList').append(b);
 }
 if(!$('#objectList').children.length){const p=document.createElement('p');p.className='muted';p.textContent='未找到地名，可尝试历史名、现代名或别名。';$('#objectList').append(p)}
}
$('#inspector').onsubmit=e=>{
 e.preventDefault();const values=Object.fromEntries(new FormData(e.target));delete values.source_year;
 if(Object.hasOwn(values,'aliases')){if(values.aliases===chosen()[0]?.aliases.join('；'))delete values.aliases;else values.aliases=values.aliases.split(/[;；\n]+/).map(a=>a.trim()).filter(Boolean)}
 mutate(()=>{for(const o of chosen()){applyNameValues(o,values);for(const k of ['owner','controller'])if(values[k])setAffiliation(o,k,values[k])}});toast('开局属性已保存');
};
$('#search').oninput=renderList;
$('#labelMode').onchange=e=>{labelMode=e.target.value;try{localStorage.setItem(KEY+'-label-mode',labelMode)}catch(error){toast('地名显示已切换，偏好未能保存')}render()};
$('#delete').onclick=()=>{mutate(()=>{state.regions=state.regions.filter(o=>!selected.has(o.id));state.points=state.points.filter(o=>!selected.has(o.id));selected.clear()})};$('#assign').onclick=()=>{if(!selected.size)return toast('先选择一个或多个地区');mutate(()=>chosen().forEach(o=>setAffiliation(o,mode,activeFaction)));toast('已划归 '+faction(activeFaction).name)};
$('#title').onchange=e=>mutate(()=>state.title=e.target.value);$('#year').onchange=e=>mutate(()=>state.year=Number(e.target.value));$('#mode').onchange=e=>{mode=e.target.value;render()};document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{tool=b.dataset.tool;draft=[];render()});
function finish(){if(draft.length<3)return toast('至少需要三个不同的边界点');if(new Set(draft.map(c=>c.join(','))).size<3)return toast('边界点不能重复');mutate(()=>{const r=region(uid('region'),'新地区',draft,activeFaction);state.regions.push(r);selected=new Set([r.id]);draft=[];tool='select'})}$('#finish').onclick=finish;
$('#undo').onclick=()=>{if(!history.length)return;future.push(cloneScenario(state));state=history.pop();selected.clear();persist();render()};$('#redo').onclick=()=>{if(!future.length)return;history.push(cloneScenario(state));state=future.pop();selected.clear();persist();render()};
function mapPosition(e){const p=$('#map').createSVGPoint();p.x=e.clientX;p.y=e.clientY;const t=p.matrixTransform($('#map').getScreenCTM().inverse());return[t.x,t.y]}
function setAffiliation(o,key,value){o[key]=value;for(const child of state.regions)if(child.parent_id===o.id)child[key]=value}
function brushHit(id,erase=false){const o=state.regions.find(r=>r.id===id);if(!o)return;if(state.sample_id==='eastasia1640'&&o.unit_type!=='modern_county')return;if(tool==='paint'){setAffiliation(o,mode,activeFaction);selected.add(id)}else{erase?selected.delete(id):selected.add(id)}const path=document.querySelector(`path[data-id="${CSS.escape(id)}"]`);if(path){path.classList.toggle('selected',selected.has(id));path.setAttribute('fill',faction(o[mode])?.color||'#aaa')}$('#count').textContent=state.regions.length+' 地区 · 已选 '+selected.size}
$('#clearSelection').onclick=()=>{selected.clear();render()};
$('#selectGroup').onclick=()=>{const o=chosen()[0];if(!o)return toast('先选一个分块');const historical=o.prefecture;const group=state.regions.filter(r=>historical?r.prefecture===historical&&r.province===o.province:r.modern_prefecture&&r.modern_prefecture===o.modern_prefecture&&r.modern_province===o.modern_province&&r.theater===o.theater&&(r.source_region_code||'')===(o.source_region_code||''));if(!group.length)return toast('该对象没有府或现代市分组');selected=new Set(group.map(r=>r.id));render();toast(historical?'已选同府地区':'已选同一现代市组；不代表明代府界')};
$('#map').onpointerdown=e=>{if(e.button!==0)return;const id=e.target.dataset.id;const vertex=e.target.dataset.vertex;if(['paint','brush'].includes(tool)&&id&&state.regions.some(r=>r.id===id)){if(state.sample_id==='eastasia1640'&&state.regions.find(r=>r.id===id)?.unit_type!=='modern_county'){toast('此处是历史参考面；请在分块上涂标记，或用选择工具编辑参考面属性');return}drag={kind:'brush',before:tool==='paint'?cloneScenario(state):null,erase:e.shiftKey};brushHit(id,e.shiftKey);$('#map').setPointerCapture(e.pointerId);return}if(vertex!==undefined){drag={kind:'vertex',before:cloneScenario(state),id:e.target.dataset.region,pi:+e.target.dataset.poly,ri:+e.target.dataset.ring,vi:+vertex};const target=state.regions.find(r=>r.id===drag.id);target.geometry=structuredClone(target.geometry);$('#map').setPointerCapture(e.pointerId);return}if(tool==='draw'){draft.push(unproject(mapPosition(e)));render();return}if(tool==='point'){const coordinates=unproject(mapPosition(e));mutate(()=>{const p={...blankProps,id:uid('point'),name:'新据点',kind:'城池',coordinates,owner:activeFaction,controller:activeFaction};state.points.push(p);selected=new Set([p.id]);tool='select'});return}if(id&&tool==='vertex'&&state.points.some(p=>p.id===id)){selected=new Set([id]);drag={kind:'point',before:cloneScenario(state),id};$('#map').setPointerCapture(e.pointerId);render();return}if(id&&tool==='select')return;if(id){if(e.shiftKey){selected.has(id)?selected.delete(id):selected.add(id)}else selected=new Set([id]);render();return}drag={kind:'pan',start:mapPosition(e),view:[...view],sx:e.clientX,sy:e.clientY};$('#map').setPointerCapture(e.pointerId)};
$('#map').onpointermove=e=>{const xy=mapPosition(e),[lon,lat]=unproject(xy);$('#coords').textContent=`${lon.toFixed(2)}° E / ${lat.toFixed(2)}° N`;if(!drag)return;if(drag.kind==='brush'){const hit=document.elementFromPoint(e.clientX,e.clientY);brushHit(hit?.dataset.id,drag.erase);return}if(drag.kind==='pan'){const p=$('#map').createSVGPoint();p.x=e.clientX;p.y=e.clientY;const t=p.matrixTransform($('#map').getScreenCTM().inverse());setView([view[0]+drag.start[0]-t.x,view[1]+drag.start[1]-t.y,view[2],view[3]])}else if(drag.kind==='point'){state.points.find(p=>p.id===drag.id).coordinates=[Math.max(-180,Math.min(180,lon)),Math.max(-90,Math.min(90,lat))];render()}else{const r=state.regions.find(o=>o.id===drag.id),ps=r.geometry.type==='Polygon'?[r.geometry.coordinates]:r.geometry.coordinates,ring=ps[drag.pi][drag.ri];pathCache.delete(r.geometry);boundsCache.delete(r.geometry);ring[drag.vi]=[Math.max(-180,Math.min(180,lon)),Math.max(-90,Math.min(90,lat))];if(drag.vi===0)ring[ring.length-1]=[...ring[0]];render()}};
function endDrag(e){clearTimeout(panRenderTimer);panRenderTimer=0;if(!drag)return;if(drag.kind==='brush'){if(drag.before){history.push(drag.before);if(history.length>8)history.shift();future=[];persist()}}else if(['vertex','point'].includes(drag.kind)){history.push(drag.before);if(history.length>8)history.shift();future=[];persist()}else if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<3){selected.clear()}drag=null;render()}$('#map').onpointerup=endDrag;$('#map').onpointercancel=e=>{if(drag?.before)state=drag.before;drag=null;render()};
function zoom(f,anchor){const[x,y]=anchor||[view[0]+view[2]/2,view[1]+view[3]/2];const w=Math.max(.1,Math.min(3600,view[2]*f)),h=view[3]*w/view[2];setView([x-(x-view[0])*w/view[2],y-(y-view[1])*h/view[3],w,h]);render()}
$('#map').addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?1.15:.87,mapPosition(e))},{passive:false});$('#zoomIn').onclick=()=>zoom(.8);$('#zoomOut').onclick=()=>zoom(1.25);$('#home').onclick=()=>{southeastCountry='';southasiaCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;northArea='';setView(state.sample_id==='eastasia1640'?[850,220,700,520]:[950,340,530,470]);render()};$('#world').onclick=()=>{southeastCountry='';southasiaCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;northArea='';setView([-1800,0,3600,1800]);render()};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||$('#dialog').open)return;if(e.key==='Enter'&&tool==='draw')finish();if(e.key==='Escape'){draft=[];tool='select';render()}if((e.metaKey||e.ctrlKey)&&e.key==='z'){e.preventDefault();(e.shiftKey?$('#redo'):$('#undo')).click()}});
function modal(title,build,apply){$('#dialogTitle').textContent=title;$('#dialogBody').replaceChildren();build($('#dialogBody'));$('#dialogApply').onclick=()=>{try{apply();$('#dialog').close()}catch(e){toast(e.message)}};$('#dialog').showModal()}$('#dialogClose').onclick=()=>$('#dialog').close();function field(container,label,value,type='text'){const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.type=type;input.value=value;l.append(input);container.append(l);return input}
$('#addFaction').onclick=()=>{let name,color;modal('添加政治势力',b=>{name=field(b,'势力名称','新势力');color=field(b,'地图颜色','#637f75','color')},()=>{if(!name.value.trim())throw Error('请输入名称');mutate(()=>{const f={id:uid('faction'),name:name.value.trim(),color:color.value};state.factions.push(f);activeFaction=f.id})})};
function pickFile(accept,callback){const f=$('#file');f.value='';f.accept=accept;f.onchange=async()=>{if(!f.files[0])return;try{await callback(f.files[0])}catch(e){toast('导入失败：'+e.message)}};f.click()}
$('#load').onclick=()=>pickFile('.json,application/json',async f=>{const s=JSON.parse(await f.text());validate(s);mutate(()=>{state=s;selected.clear();draft=[]});toast('剧本已加载')});
async function scenarioBlob(s){
 s=cloneScenario(s);
 // Large exports use a disk-backed browser file so geometry and the whole output
 // do not compete for the renderer heap. Small/unsupported contexts retain Blob export.
 let writer=null,handle=null,directory=null,fileName=null;
 if(s.regions.length>5000&&navigator.storage?.getDirectory){
  const root=await navigator.storage.getDirectory();directory=await root.getDirectoryHandle('atlas-exports',{create:true});
  for await(const [name,entry] of directory.entries())if(entry.kind==='file'&&name.startsWith('export-')){const previous=await entry.getFile();if(Date.now()-previous.lastModified>86400000)await directory.removeEntry(name)}
  fileName='export-'+crypto.randomUUID()+'.json';handle=await directory.getFileHandle(fileName,{create:true});writer=await handle.createWritable();
 }
 const parts=[];const write=async value=>{if(writer)await writer.write(value);else parts.push(typeof value==='string'?new Blob([value]):value)};
 try{
  await write('{');let first=true;
  for(const [key,value] of Object.entries(s)){
   if(value===undefined)continue;
   await write((first?'':',')+JSON.stringify(key)+':');first=false;
   if((key==='regions'||key==='points')&&Array.isArray(value)){
    await write('[');
    for(let i=0;i<value.length;i+=100){await write((i?',':'')+value.slice(i,i+100).map(o=>JSON.stringify(o)).join(','));if(i%1000===0)await new Promise(resolve=>setTimeout(resolve,0))}
    await write(']');
   }else await write(JSON.stringify(value));
  }
  await write('}');
  if(writer){await writer.close();return await handle.getFile()}
  return new Blob(parts,{type:'application/json'});
 }catch(error){if(writer){await writer.abort().catch(()=>{});await directory.removeEntry(fileName).catch(()=>{})}throw error}
}
$('#export').onclick=async()=>{const button=$('#export'),year=state.year;button.disabled=true;toast('正在生成完整开局文件…');try{const blob=await scenarioBlob(state),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`舆图-${year}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('已导出独立开局数据')}catch(error){toast('导出失败：'+error.message)}finally{button.disabled=false}};
$('#reference').onclick=()=>{let west,south,east,north,opacity;modal('参考底图 · 经纬度配准',b=>{const p=document.createElement('p');p.textContent='上传 PNG、JPEG 或 WebP 图片，并填写图片四边对应的经纬度。此版本使用矩形配准；古地图的局部畸变仍需人工判断。图片保存在剧本中。';b.append(p);const btn=document.createElement('button');btn.textContent='选择图片';let url=state.reference?.url;btn.onclick=()=>pickFile('image/png,image/jpeg,image/webp',f=>new Promise((resolve,reject)=>{if(f.size>4*1024*1024)return reject(Error('请使用小于4MB的参考图片'));const r=new FileReader();r.onload=()=>{url=r.result;btn.textContent='已选择：'+f.name;resolve()};r.onerror=reject;r.readAsDataURL(f)}));b.append(btn);b.dataset.url='';b.getUrl=()=>url;const bounds=state.reference?.bounds||[100,20,135,50];west=field(b,'西边界经度',bounds[0],'number');south=field(b,'南边界纬度',bounds[1],'number');east=field(b,'东边界经度',bounds[2],'number');north=field(b,'北边界纬度',bounds[3],'number');opacity=field(b,'透明度 0—1',state.reference?.opacity??.5,'number');const remove=document.createElement('button');remove.textContent='移除参考底图';remove.onclick=()=>{mutate(()=>state.reference=null);$('#dialog').close()};b.append(remove)},()=>{const r={url:$('#dialogBody').getUrl(),bounds:[west,south,east,north].map(i=>Number(i.value)),opacity:Number(opacity.value)};validate({...state,reference:r});mutate(()=>state.reference=r)})};
$('#geoimport').onclick=()=>pickFile('.geojson,.json',async f=>{const g=JSON.parse(await f.text());if(g.type!=='FeatureCollection'||!Array.isArray(g.features))throw Error('需要 GeoJSON FeatureCollection');const regions=g.features.map((f,i)=>({...blankProps,...f.properties,id:String(f.properties?.id||uid('region')),name:String(f.properties?.name||'导入地区 '+(i+1)),owner:f.properties?.owner||activeFaction,controller:f.properties?.controller||activeFaction,confidence:f.properties?.confidence||'待核验',geometry:f.geometry}));validate({...state,regions:[...state.regions,...regions]});mutate(()=>state.regions.push(...regions));toast(`已导入 ${regions.length} 个地区`)});
function applyCommands(commands){if(!Array.isArray(commands))throw Error('指令必须是数组');const next=cloneScenario(state);const allowed=new Set(['historical_name','modern_name','aliases','name_source','name_confidence','name','owner','controller','status','province','prefecture','county','command','wei','suo','source','confidence','notes','kind']);for(const c of commands){if(c.op==='set'){const list=[...next.regions,...next.points].filter(o=>(c.ids||[]).includes(o.id));if(!list.length||list.length!==new Set(c.ids).size)throw Error('指令包含不存在的对象编号');if(!c.values||Object.keys(c.values).some(k=>!allowed.has(k)))throw Error('包含不允许修改的属性');for(const o of list){applyNameValues(o,c.values);for(const key of ['owner','controller'])if(c.values[key])for(const child of next.regions)if(child.parent_id===o.id)child[key]=c.values[key]}}else if(c.op==='addRegion')next.regions.push({...blankProps,...c.region});else if(c.op==='addPoint')next.points.push({...blankProps,...c.point});else if(c.op==='addFaction')next.factions.push(c.faction);else throw Error('未知操作：'+c.op)}validate(next);mutate(()=>state=next);return next}
$('#commands').onclick=()=>{let ta;modal('指令工作台',b=>{const p=document.createElement('p');p.textContent='你可以在当前对话提出自然语言要求，我会整理成以下指令。粘贴后应用，或通过 window.atlas API 批量修改。所有指令先校验、整批执行，并支持撤销。此处不自动联网搜索。';b.append(p);ta=document.createElement('textarea');ta.rows=12;ta.value=JSON.stringify([{op:'set',ids:chosen().map(o=>o.id).length?chosen().map(o=>o.id):[state.regions[0]?.id].filter(Boolean),values:{controller:activeFaction,status:'游戏设定',notes:'通过指令调整开局'}}],null,2);b.append(ta);const p2=document.createElement('p');p2.textContent='支持 set / addRegion / addPoint / addFaction。完整对象编号见导出文件。';b.append(p2)},()=>{applyCommands(JSON.parse(ta.value));toast('指令已应用')})};
window.atlas={getState:(options={})=>{
 if(options.geometry===false)return {...structuredClone(Object.fromEntries(Object.entries(state).filter(([key])=>key!=='regions'))),regions:state.regions.map(({geometry,...attributes})=>structuredClone(attributes))};
 return structuredClone(state);
},getObject:id=>{const object=[...state.regions,...state.points].find(o=>o.id===id);return object?structuredClone(object):null},applyCommands,load:s=>{validate(s);mutate(()=>{state=structuredClone(s);selected.clear()})},select:ids=>{selected=new Set(ids);render()},project,unproject};
$('#useSample').onclick=()=>{const sample=ATLAS_SAMPLES.find(s=>s.sample_id===$('#sample').value);if(!sample)return;mutate(()=>{state=cloneScenario(sample);selected.clear();draft=[];southeastCountry='';southasiaCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;northArea='';showCountyBlocks=sample.sample_id==='eastasia1640'||sample.sample_id==='county-blocks';$('#showCounties').checked=showCountyBlocks;tool='select'});setView(state.sample_id==='eastasia1640'?[850,220,700,520]:[950,340,530,470]);render();toast('已载入历史样本；原工作稿可通过撤销恢复')};
if(typeof SOUTHEAST_SUBDIVISIONS!=='undefined')for(const c of SOUTHEAST_SUBDIVISIONS.countries){
 const option=document.createElement('option');option.value=c.iso;option.textContent=c.name+' · '+c.count+'块';$('#southeastCountry').append(option);
}
$('#southeastCountry').onchange=e=>{southeastCountry=e.target.value;southasiaCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;northArea='';showCountyBlocks=true;const c=typeof SOUTHEAST_SUBDIVISIONS!=='undefined'&&SOUTHEAST_SUBDIVISIONS.countries.find(c=>c.iso===southeastCountry);setView(c?c.view:[880,600,580,500]);render()};
for(const f of BASEMAP){$('#land').append(node('path',{d:pathGeometry(f.geometry),fill:'#eeeadd',stroke:'none','stroke-width':.5,'vector-effect':'non-scaling-stroke','fill-rule':'evenodd','pointer-events':'none'}))}setView(view);render();

$('#restorePrevious').hidden=!localStorage.getItem(KEY+'-pre-county-backup');
$('#restorePrevious').onclick=()=>{const saved=localStorage.getItem(KEY+'-pre-county-backup');if(!saved)return;const old=decodeSaved(JSON.parse(saved));validate(old);mutate(()=>{state=old;selected.clear();tool='select'});const url=new URL(location.href);url.searchParams.delete('counties');window.history.replaceState({},'',url);toast('已恢复切换分块前的旧稿')};
if(switchedToCounties){persist();toast('分块已载入；原稿已备份，可点击恢复旧稿')}

$('#showCounties').onchange=e=>{showCountyBlocks=e.target.checked;render()};
$('#taiwanView').onclick=()=>{southeastCountry='';southasiaCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;northArea='';showCountyBlocks=true;setView([1180,630,90,85]);render()};
$('#koreaView').onclick=()=>{southeastCountry='';southasiaCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;northArea='';showCountyBlocks=true;setView([1230,455,105,125]);render()};
$('#japanView').onclick=()=>{southeastCountry='';southasiaCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;northArea='';showCountyBlocks=true;setView([1220,420,265,260]);render()};
$('#restore1640').hidden=!localStorage.getItem(KEY+'-pre1640-backup');
$('#restore1640').onclick=()=>{const old=decodeSaved(JSON.parse(localStorage.getItem(KEY+'-pre1640-backup')));validate(old);mutate(()=>{state=old;selected.clear();tool='select'});toast('已恢复1640更新前的工作稿')};
if(introduced1640){if(persist()){localStorage.setItem(KEY+'-1640-revision','1')}toast('工作稿已保留，地名字段已补齐；原稿已备份')}
if(repairedLiaodong&&persist())toast('辽东及辽西前线已修补；原工作稿已备份，人工编辑已保留');
setView(view);

$('#countyView').onclick=()=>{southeastCountry='';southasiaCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;northArea='';showCountyBlocks=true;setView([1080,490,130,110]);render();toast('分块编辑视野；点击选择，Shift 多选，可统一划归')};

// 使用 click 完成普通选择，兼容真实指针与浏览器辅助点击。
$('#map').onclick=e=>{const id=e.target.dataset.id;if(tool!=='select'||!id)return;if(e.shiftKey){selected.has(id)?selected.delete(id):selected.add(id)}else selected=new Set([id]);render()};

$('#southeastView').onclick=()=>{southeastCountry='';southasiaCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;northArea='';showCountyBlocks=true;setView([880,600,580,500]);render()};

if(introducedForeignBlocks&&persist())toast('朝鲜、日本和台湾分块已补入；已有编辑保持原值');

if(introducedSoutheastBlocks&&persist())toast('东南亚11国分块已补入；已有地名、归属与手绘边界保持原值');

if(typeof MONGOL_SUBDIVISIONS!=='undefined')for(const area of MONGOL_SUBDIVISIONS.areas){const option=document.createElement('option');option.value=area.id;option.textContent=area.name;$('#northArea').append(option)}
function northView(id){northArea=id;southeastCountry='';southasiaCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;showCountyBlocks=true;const area=typeof MONGOL_SUBDIVISIONS!=='undefined'&&MONGOL_SUBDIVISIONS.areas.find(a=>a.id===id);setView(area?area.view:[430,300,1010,300]);render()}
$('#mongolView').onclick=()=>northView('all');
$('#northArea').onchange=e=>northView(e.target.value);

if(introducedMongolBlocks&&persist())toast('蒙古诸部与女真参考已补入；已有编辑保持原值');

if(typeof SOUTHASIA_SUBDIVISIONS!=='undefined')for(const c of SOUTHASIA_SUBDIVISIONS.countries){
 const option=document.createElement('option');option.value=c.iso;option.textContent=c.name+' · '+c.count+'块';$('#southasiaCountryView').append(option);
}
function southasiaView(iso=''){
 southasiaCountry=iso;southeastCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;northArea='';showCountyBlocks=true;
 const p=typeof SOUTHASIA_SUBDIVISIONS!=='undefined'&&SOUTHASIA_SUBDIVISIONS,c=p&&p.countries.find(c=>c.iso===iso);
 setView(c?c.view:(p?.view||[585,500,410,425]));render();
}
$('#southasiaView').onclick=()=>southasiaView();
$('#southasiaCountryView').onchange=e=>southasiaView(e.target.value);
if(introducedSouthasiaBlocks&&persist())toast('南亚8国分块已补入；已有地名、归属与手绘边界保持原值');

if(typeof CENTRALASIA_SUBDIVISIONS!=='undefined')for(const c of CENTRALASIA_SUBDIVISIONS.countries){
 const option=document.createElement('option');option.value=c.iso;option.textContent=c.name+' · '+c.count+'块';$('#centralasiaCountryView').append(option);
}
function centralasiaView(iso=''){
 centralasiaCountry=iso;southeastCountry='';southasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;northArea='';showCountyBlocks=true;
 const p=typeof CENTRALASIA_SUBDIVISIONS!=='undefined'&&CENTRALASIA_SUBDIVISIONS,c=p&&p.countries.find(c=>c.iso===iso);
 setView(c?c.view:(p?.view||[450,320,455,260]));render();
}
$('#centralasiaView').onclick=()=>centralasiaView();
$('#centralasiaCountryView').onchange=e=>centralasiaView(e.target.value);
if(introducedCentralasiaBlocks&&persist())toast('中亚5国分块已补入；已有地名、归属与手绘边界保持原值');

if(typeof RUSSIA_SUBDIVISIONS!=='undefined')for(const a of RUSSIA_SUBDIVISIONS.areas){const o=document.createElement('option');o.value=a.id;o.textContent=a.name;$('#russiaAreaView').append(o)}
function russiaView(id='main'){
 southeastCountry='';southasiaCountry='';centralasiaCountry='';northArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;russiaArea=id;showCountyBlocks=true;
 const p=typeof RUSSIA_SUBDIVISIONS!=='undefined'&&RUSSIA_SUBDIVISIONS,a=p&&p.areas.find(a=>a.id===id);setView(a?a.view:p?p.view:[190,60,1650,450]);render();
}
$('#russiaView').onclick=()=>russiaView();$('#russiaAreaView').onchange=e=>russiaView(e.target.value||'main');
if(introducedRussiaBlocks&&persist())toast('俄罗斯分块已补入；已有地名、归属与手绘边界保持原值');

if(typeof MIDDLEEAST_SUBDIVISIONS!=='undefined')for(const c of MIDDLEEAST_SUBDIVISIONS.countries){
 const option=document.createElement('option');option.value=c.iso;option.textContent=c.name+' · '+c.count+'块';$('#middleeastCountryView').append(option);
}
function middleeastView(iso=''){
 middleeastCountry=iso;middleeastOverview=true;europeCountry='';europeOverview=false;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;southeastCountry='';southasiaCountry='';centralasiaCountry='';russiaArea='';northArea='';showCountyBlocks=true;
 const p=typeof MIDDLEEAST_SUBDIVISIONS!=='undefined'&&MIDDLEEAST_SUBDIVISIONS,c=p&&p.countries.find(c=>c.iso===iso);
 setView(c?c.view:(p?.view||[450,320,455,260]));render();
}
$('#middleeastView').onclick=()=>middleeastView();
$('#middleeastCountryView').onchange=e=>middleeastView(e.target.value);
if(introducedMiddleeastBlocks&&persist())toast('中东分块已补入；已有地名、归属与手绘边界保持原值');

if(typeof EUROPE_SUBDIVISIONS!=='undefined')for(const c of EUROPE_SUBDIVISIONS.countries){
 const o=document.createElement('option');o.value=c.iso;o.textContent=c.name+(c.reused?' · 复用已有分块':' · '+c.count+'块');$('#europeCountryView').append(o);
}
function europeView(iso=''){
 southeastCountry='';southasiaCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;northArea='';europeCountry=iso;europeOverview=true;africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;showCountyBlocks=true;
 const p=typeof EUROPE_SUBDIVISIONS!=='undefined'&&EUROPE_SUBDIVISIONS,c=p&&p.countries.find(c=>c.iso===iso);setView(c?c.view:(p?.view||[-310,55,1000,630]));render();
}
$('#europeView').onclick=()=>europeView();$('#europeCountryView').onchange=e=>europeView(e.target.value);
if(introducedEuropeBlocks&&persist())toast('欧洲分块已补入；已有地名、归属与手绘边界保持原值');

if(typeof AFRICA_SUBDIVISIONS!=='undefined')for(const c of AFRICA_SUBDIVISIONS.countries){
 const o=document.createElement('option');o.value=c.iso;o.textContent=c.name+(c.reused?' · 复用已有分块':' · '+c.count+'块');$('#africaCountryView').append(o);
}
function africaView(iso=''){
 southeastCountry='';southasiaCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;northArea='';africaCountry=iso;africaOverview=true;americasCountry='';americasOverview=false;oceaniaCountry='';oceaniaOverview=false;showCountyBlocks=true;
 const p=typeof AFRICA_SUBDIVISIONS!=='undefined'&&AFRICA_SUBDIVISIONS,c=p&&p.countries.find(c=>c.iso===iso);setView(c?c.view:(p?.view||[-300,480,1000,950]));render();
}
$('#africaView').onclick=()=>africaView();$('#africaCountryView').onchange=e=>africaView(e.target.value);
if(introducedAfricaBlocks&&persist())toast('非洲分块已补入；已有地名、归属与手绘边界保持原值');

if(typeof AMERICAS_SUBDIVISIONS!=='undefined')for(const c of AMERICAS_SUBDIVISIONS.countries){
 const o=document.createElement('option');o.value=c.iso;o.textContent=c.name+' · '+c.count+(c.iso==='CAN'?'个经济统计区':c.source_admin_level==='ADM0'||c.source_admin_level==='MAP_UNIT'?'个全域参考块':c.source_admin_level==='ADM1'?'个一级参考块':'块');$('#americasCountryView').append(o);
 if(c.iso==='USA')for(const [id,name] of [['mainland','美国 · 本土48州'],['alaska','美国 · 阿拉斯加西半球'],['hawaii','美国 · 夏威夷主岛']]){const option=document.createElement('option');option.value='USA:'+id;option.textContent=name;$('#americasCountryView').append(option)}
}
function americasView(iso=''){
 southeastCountry='';southasiaCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;northArea='';americasCountry=iso;americasOverview=true;oceaniaCountry='';oceaniaOverview=false;africaCountry='';africaOverview=false;showCountyBlocks=true;
 const p=typeof AMERICAS_SUBDIVISIONS!=='undefined'&&AMERICAS_SUBDIVISIONS,c=p&&p.countries.find(c=>c.iso===iso),area={mainland:[-1280,370,640,300],alaska:[-1830,170,560,270],hawaii:[-1620,660,90,70]}[iso.split(':')[1]];setView(area||(c?c.view:(p?.view||[-1800,60,1700,1440])));render();
}
$('#americasView').onclick=()=>americasView();$('#americasCountryView').onchange=e=>americasView(e.target.value);
if(introducedAmericasBlocks&&persist())toast('美洲分块已补入；已有地名、归属与手绘边界保持原值');

if(typeof OCEANIA_SUBDIVISIONS!=='undefined')for(const c of OCEANIA_SUBDIVISIONS.countries){
 const o=document.createElement('option');o.value=c.iso;o.textContent=c.name+' · '+c.count+(c.source_admin_level==='ADM0'||c.source_admin_level==='MAP_UNIT'?'个全域参考块':c.source_admin_level==='ADM1'?'个一级参考块':'块');$('#oceaniaCountryView').append(o);
}
function oceaniaView(iso=''){
 southeastCountry='';southasiaCountry='';centralasiaCountry='';russiaArea='';middleeastCountry='';middleeastOverview=false;europeCountry='';europeOverview=false;northArea='';africaCountry='';africaOverview=false;americasCountry='';americasOverview=false;oceaniaCountry=iso;oceaniaOverview=true;showCountyBlocks=true;
 const p=typeof OCEANIA_SUBDIVISIONS!=='undefined'&&OCEANIA_SUBDIVISIONS,c=p&&p.countries.find(c=>c.iso===iso);setView(c?c.view:(p?.view||[1100,600,800,850]));render();
}
$('#oceaniaView').onclick=()=>oceaniaView();$('#oceaniaCountryView').onchange=e=>oceaniaView(e.target.value);
if(introducedOceaniaBlocks&&persist())toast('大洋洲与偏远岛屿参考已补入；已有编辑保持原值');
