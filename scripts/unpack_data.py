#!/usr/bin/env python3
"""Decode shipped map data into original objects or WGS84 GeoJSON."""
import argparse,base64,gzip,json,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'public'
def decode(g):
    if '__atlas_binary' not in g:return g
    points=iter(struct.iter_unpack('<dd',base64.b64decode(g['__atlas_binary'])))
    polys=[[[list(next(points)) for _ in range(n)] for n in rings] for rings in g['__atlas_rings']]
    return dict(type=g['type'],coordinates=polys[0] if g['type']=='Polygon' else polys)
def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--pack',required=True,help='e.g. EUROPE_SUBDIVISIONS');parser.add_argument('--output',required=True,type=Path);parser.add_argument('--geojson',action='store_true');args=parser.parse_args()
    manifest=json.loads((ROOT/'data/maps/manifest.json').read_text());pack=next(p for p in manifest['packs'] if p['global']==args.pack)
    def read(item):return json.loads(gzip.decompress((ROOT/item['path']).read_bytes()))
    data=read(pack['header']) if pack.get('header') else []
    rows=data.setdefault(pack['shape'],[]) if pack['shape'] in ['regions','features'] else data
    for item in pack['chunks']:
        for row in read(item):
            if isinstance(row,dict) and 'geometry' in row:row['geometry']=decode(row['geometry'])
            rows.append(row)
    if args.geojson:
        data=dict(type='FeatureCollection',features=[dict(type='Feature',geometry=row['geometry'],properties={k:v for k,v in row.items() if k!='geometry'}) for row in rows])
    args.output.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n');print(args.output)
if __name__=='__main__':main()
