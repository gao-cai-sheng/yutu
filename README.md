# 舆图 · yutu

一个在浏览器里编辑历史开局地图的工作台。

**[在线体验](https://gao-cai-sheng.github.io/yutu/)**

选择地区、涂色划归、编辑历史名和今名、调整边界与据点，支持撤销、浏览器自动保存及完整 JSON 导出。现有样本包含 52,799 个地区和 54 个据点。现代行政分块是空间参考，不能当作已经核实的 1640 年疆界或历史府县。

## 使用

建议用桌面端新版浏览器。首次需要下载地图数据，请等待顶部加载进度完成。资料和编辑均在浏览器中处理；自动保存属于当前浏览器来源，请定期导出 JSON 备份。在线体验不会自动读取以前本地页面的存档：需要在原页面导出后，再在体验页面点击“加载剧本”。

地图数据较大，低内存设备可能仍有明显开销。当前已经采用无损二进制坐标、有上限的解码缓存和视野筛选，仍会加载全球原始数据。

本地运行无需 npm 或构建工具：

```sh
python3 -m http.server 8000 --directory public
```

然后打开 <http://localhost:8000>。请通过 HTTP 访问，不直接双击 HTML。

## 仓库结构

- `public/`：HTML、CSS、JavaScript 和运行所需地图资料。
- `public/data/maps/`：无损压缩数据块及清单，均小于 GitHub 单文件限制。
- `public/sources/`：地图来源、作者、原许可及年代记录。
- `scripts/`：数据打包、解码及发布检查。
- `tests/`：隔离浏览器烟雾检查。
- `.github/workflows/pages.yml`：自动发布 GitHub Pages。

图片、下载缓存、重复 GeoJSON、研究报告、个人工作稿和其他游戏工程不在本仓库中。

## 验证与更新

```sh
python3 scripts/check_release.py
pip install playwright
playwright install chromium
python3 tests/smoke.py
```

修改运行代码后推送 `main`，GitHub Actions 会检查数据并重新部署。地图来源说明见 [NOTICE.md](NOTICE.md) 和 [来源目录](public/sources/index.html)。代码与第三方地图资料的权利和许可应分别看待，不将混合地图资料统一重新许可。
