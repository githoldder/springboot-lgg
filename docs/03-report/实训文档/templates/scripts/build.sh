#!/usr/bin/env bash
#
# build.sh — 编译 LaTeX 论文
# 可从任意目录运行，自动定位到 LaTeX 项目根目录
#
set -euo pipefail

# 定位脚本所在目录 → LaTeX 项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LATEX_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MAIN="${MAIN:-template}"
FINAL_PDF="${FINAL_PDF:-/Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档/23030301曹磊/5课程报告.pdf}"

cleanup_intermediates() {
  rm -f \
    "$MAIN.aux" "$MAIN.bbl" "$MAIN.blg" "$MAIN.fdb_latexmk" \
    "$MAIN.fls" "$MAIN.log" "$MAIN.out" "$MAIN.toc" "$MAIN.xdv" \
    "$MAIN.synctex.gz" "$MAIN.listing" "bu.aux" "texput.log"
}

cd "$LATEX_DIR"
echo "📂 Working: $(pwd)"
echo "📄 Main: $MAIN.tex"

echo "🔨 xelatex (1/4)..."
xelatex -interaction=nonstopmode "$MAIN"

echo "📚 bibtex (2/4)..."
bibtex "$MAIN"

echo "🔨 xelatex (3/4)..."
xelatex -interaction=nonstopmode "$MAIN"

echo "🔨 xelatex (4/4)..."
xelatex -interaction=nonstopmode "$MAIN"

# 结果
PDF_SIZE=$(ls -lh "$MAIN.pdf" | awk '{print $5}')
PAGES=$(sed -nE "s/^Output written on .*\\(([0-9]+) pages\\).*/\\1/p" "$MAIN.log" | tail -n 1)
OVERFULL=$(grep -c "Overfull" "$MAIN.log" 2>/dev/null || true)
mkdir -p "$(dirname "$FINAL_PDF")"
cp "$MAIN.pdf" "$FINAL_PDF"
echo "📦 Updated: $FINAL_PDF"
mkdir -p "$(dirname "$FINAL_PDF2")"
cp "$MAIN.pdf" "$FINAL_PDF2"
echo "📦 Updated: $FINAL_PDF2"

cleanup_intermediates
echo "🧹 Cleaned intermediate files"
echo "✅ Done: $MAIN.pdf ($PDF_SIZE, ${PAGES:-unknown} pages, $OVERFULL overfull)"
