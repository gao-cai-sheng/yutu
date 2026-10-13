#!/usr/bin/env python3
"""Verify all shipped map chunks, hashes, counts and absence of extra media."""
import gzip,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];SITE=ROOT/'public'
manifest=json.loads((SITE/'data/maps/manifest.json').read_text());assert manifest['version']==1
expected=set();total=0;count=0
for pack in manifest['packs']:
    rows=0
    for item in ([pack['header']] if pack.get('header') else [])+pack['chunks']:
        path=SITE/item['path'];blob=path.read_bytes()
        assert len(blob)==item['bytes'] and hashlib.sha256(blob).hexdigest()==item['sha256'],path
        assert len(blob)<50*1024*1024,path
        data=json.loads(gzip.decompress(blob));expected.add(path.resolve());total+=len(blob);count+=1
        if item in pack['chunks']:assert isinstance(data,list);rows+=len(data)
    assert rows==pack['count'],pack['global']
assert set(p.resolve() for p in (SITE/'data/maps').glob('*.gz'))==expected,'Unreferenced map data'
for p in ROOT.rglob('*'):
    if '.git' in p.parts or not p.is_file():continue
    if p.parent==ROOT/'docs/screenshots':continue
    assert p.suffix.lower() not in {'.png','.jpg','.jpeg','.webp','.heic','.gif','.tif','.tiff','.zip'},p
    assert p.stat().st_size<100*1024*1024,p
assert sum(p.stat().st_size for p in SITE.rglob('*') if p.is_file())<1024*1024*1024,'Pages site too large'
print(f'RELEASE_CHECK_PASS: {len(manifest["packs"])} packs, {count} data files, {total/1024/1024:.1f} MiB')
