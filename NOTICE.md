# 地图资料来源与权利说明

本仓库中的地图不是统一许可的数据集。各记录保留原作者、来源 URL、数据年份和原许可，详细清单位于 `public/sources/`，编辑器页面底部亦提供署名链接。数据块头部和完整剧本导出保留来源元信息。

全球现代分块包含 geoBoundaries、Natural Earth、OpenStreetMap 派生来源及各国开放地理资料。OSM 来源按 ODbL 保留，不能因为 geoBoundaries 元数据还有其他许可标记而替代 ODbL。CC BY、CC BY-SA、OGL、Etalab、德国 dl-de/by-2-0、swisstopo 等分别依来源记录；不暗示原作者认可本编辑器。

部分早期历史样本的服务元数据没有明确许可字段，仍保留这一事实，不据此推定商业使用权；这些历史参考样本不代表精确复原。来源见 `historical-sources.json`、`eastasia1640.sources.json` 和 `counties.sources.json`。底图来自原项目 world-packed 地理轮廓，原 GIS 许可尚待追溯，不能据此宣称整个地图数据集可任意商用。

运行资料采用分块和 gzip 压缩；现代分块坐标以 Float64 无损编码，未额外简化边界或删去地区。既有资料的历史精度、现代源断面和原始处理记录随资料保留。原始完整几何可由 `scripts/unpack_data.py` 解码成 GeoJSON，以便查阅、修订和依原许可使用。现代国界参考层及边界补块的独立来源记录也位于 `public/sources/`。README 截图由隔离浏览器加载默认样本生成，不包含私人工作稿。未发布下载缓存、私人参考图片或游戏商业素材。
