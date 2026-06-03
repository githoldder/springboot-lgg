data 目录说明

本目录放中间数据。

extracted-sources
  从 docs/01-resource 抽取出的 txt 文本。该目录本地保留，不推远端。

规则：
1. 同一材料同时存在 docx 和 pdf 时，优先读取 pdf。
2. PDF 转 txt 时必须保留 --- PAGE n --- 页码标注。
3. 抽取文本只用于参考，不直接作为第五组最终正文。
