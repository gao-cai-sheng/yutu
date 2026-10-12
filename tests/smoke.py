#!/usr/bin/env python3
"""Load the actual shipped site in an isolated browser; no user saves or images."""
import argparse,functools,http.server,json,threading
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--url');args=parser.parse_args()
    server=None
    if args.url:url=args.url
    else:
        server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT/'public')))
        threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True);context=browser.new_context(viewport={'width':1520,'height':1000});page=context.new_page();errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)));page.set_default_timeout(30000)
            page.goto(url,timeout=180000);page.wait_for_function('typeof window.atlas !== "undefined"',timeout=900000)
            counts=page.evaluate('({regions:state.regions.length,points:state.points.length})');assert counts==dict(regions=52799,points=54),counts
            assert not page.locator('#saveState').inner_text().startswith('正在加载')
            page.locator('#oceaniaCountryView').select_option('AUS');assert page.locator('path[data-country="AUS"]').count()==545
            ident=page.evaluate("state.regions.find(r=>r.source_region_code==='AUS').id")
            page.evaluate("id=>{atlas.applyCommands([{op:'set',ids:[id],values:{historical_name:'体验烟雾检查',owner:'ming'}}])}",ident)
            assert page.evaluate('id=>atlas.getObject(id).historical_name',ident)=='体验烟雾检查'
            page.locator('#undo').click();assert page.evaluate('id=>atlas.getObject(id).historical_name',ident)==''
            page.locator('#redo').click();page.reload(timeout=180000);page.wait_for_function('window.atlas !== undefined',timeout=900000)
            assert page.evaluate('id=>atlas.getObject(id).historical_name',ident)=='体验烟雾检查'
            assert page.evaluate("()=>{const r=atlas.getObject(state.regions.find(r=>r.source_region_code==='AUS').id);r.geometry.coordinates[0][0][0]+=1;return !('__atlas_binary' in r.geometry)&&!('__atlas_rings' in r.geometry)}")
            assert page.evaluate('coordinateCache.size')<=64;assert not errors,errors
            context.close();browser.close();print('SMOKE_PASS',url,json.dumps(counts))
    finally:
        if server:server.shutdown();server.server_close()
if __name__=='__main__':main()
