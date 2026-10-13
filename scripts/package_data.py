#!/usr/bin/env python3
"""Package an existing atlas dataset without images, caches or duplicate GIS files."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import re

SCRIPTS = [
    ('modern-countries.js','MODERN_COUNTRIES','现代国界参考'),
    ('northeast-gaps.js','NORTHEAST_GAPS','外东北及中朝边界补块'),
    ('county-remainders.js','COUNTY_REMAINDERS','县块缺口补齐'),
    ('basemap.js','BASEMAP','地理底图'), ('samples.js','ATLAS_SAMPLES','历史参考样本'),
    ('county-sample.js','COUNTY_SAMPLE','中国县块'), ('eastasia1640.js','EASTASIA1640','1640工作稿'),
    ('foreign-blocks.js','EASTASIA_SUBDIVISIONS','朝鲜、日本与台湾'),
    ('southeast-blocks.js','SOUTHEAST_SUBDIVISIONS','东南亚'),
    ('mongol-blocks.js','MONGOL_SUBDIVISIONS','蒙古与女真'),
    ('southasia-blocks.js','SOUTHASIA_SUBDIVISIONS','南亚'),
    ('centralasia-blocks.js','CENTRALASIA_SUBDIVISIONS','中亚'),
    ('russia-blocks.js','RUSSIA_SUBDIVISIONS','俄罗斯'),
    ('middleeast-blocks.js','MIDDLEEAST_SUBDIVISIONS','中东'),
    ('europe-blocks.js','EUROPE_SUBDIVISIONS','欧洲'),
    ('africa-blocks.js','AFRICA_SUBDIVISIONS','非洲'),
    ('americas-blocks.js','AMERICAS_SUBDIVISIONS','美洲'),
    ('oceania-blocks.js','OCEANIA_SUBDIVISIONS','大洋洲与岛屿'),
]
CHUNK_BYTES=8*1024*1024

def encoded(value):
    return json.dumps(value,ensure_ascii=False,separators=(',',':')).encode('utf-8')

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',required=True,type=Path,help='Existing atlas runtime folder')
    parser.add_argument('--output',type=Path,default=Path(__file__).resolve().parents[1]/'public/data/maps')
    args=parser.parse_args();args.output.mkdir(parents=True,exist_ok=True)
    manifest={'version':1,'encoding':'gzip-json','packs':[]}
    def write(name,data):
        raw=encoded(data);compressed=gzip.compress(raw,compresslevel=9,mtime=0)
        if len(compressed)>=50*1024*1024:raise ValueError('Oversized chunk: '+name)
        (args.output/name).write_bytes(compressed)
        return dict(path='data/maps/'+name,bytes=len(compressed),sha256=hashlib.sha256(compressed).hexdigest())
    for filename,global_name,title in SCRIPTS:
        source=(args.source/filename).read_text()
        prefix=re.match(r'^const\s+'+global_name+r'\s*=\s*',source)
        if not prefix:raise ValueError('Unexpected data declaration: '+filename)
        value=json.loads(source[prefix.end():].strip().removesuffix(';'));del source
        pack={'global':global_name,'title':title,'chunks':[]}
        stem=filename.removesuffix('.js')
        if isinstance(value,dict) and 'regions' in value:
            pack['shape']='regions';rows=value.pop('regions');pack['header']=write(stem+'-header.json.gz',value)
        elif isinstance(value,dict) and 'features' in value:
            pack['shape']='features';rows=value.pop('features');pack['header']=write(stem+'-header.json.gz',value)
        elif isinstance(value,list):pack['shape']='array';rows=value
        else:raise ValueError('Unsupported data shape: '+filename)
        batch=[];size=2;count=0
        for row in rows:
            row_size=len(encoded(row))+1
            if batch and size+row_size>CHUNK_BYTES:
                pack['chunks'].append(write(f'{stem}-{len(pack["chunks"]):03d}.json.gz',batch));batch=[];size=2
            batch.append(row);size+=row_size;count+=1
        if batch:pack['chunks'].append(write(f'{stem}-{len(pack["chunks"]):03d}.json.gz',batch))
        pack['count']=count;manifest['packs'].append(pack)
        print(global_name,count,len(pack['chunks']),flush=True)
        del value,rows,batch
    (args.output/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print('PACKAGED',sum(p.stat().st_size for p in args.output.iterdir()),'bytes',flush=True)
if __name__=='__main__':main()
