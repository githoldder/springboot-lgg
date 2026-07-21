#!/usr/bin/env bash
#
# build.sh — 编译 LaTeX 论文 (latexmk 版)
# 可从任意目录运行，自动定位到 LaTeX 项目根目录
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LATEX_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MAIN="${MAIN:-template}"
FINAL_PDF="${FINAL_PDF:-/Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档/23030301曹磊/5课程报告.pdf}"

cd "$LATEX_DIR"
echo "📂 Working: $(pwd)"
echo "📄 Main: $MAIN.tex"

echo "🔨 latexmk -xelatex..."
latexmk -xelatex -interaction=nonstopmode -synctex=1 "$MAIN"

PDF_SIZE=$(ls -lh "$MAIN.pdf" | awk '{print $5}')
PAGES=$(sed -nE "s/^Output written on .*\\(([0-9]+) pages\\).*/\\1/p" "$MAIN.log" | tail -n 1)
OVERFULL=$(grep -c "Overfull" "$MAIN.log" 2>/dev/null || true)
mkdir -p "$(dirname "$FINAL_PDF")"
cp "$MAIN.pdf" "$FINAL_PDF"
echo "📦 Updated: $FINAL_PDF"

echo "🧹 Cleaned intermediate files"
echo "✅ Done: $MAIN.pdf ($PDF_SIZE, ${PAGES:-unknown} pages, $OVERFULL overfull)"
