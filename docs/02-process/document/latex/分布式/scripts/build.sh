#!/usr/bin/env bash
#
# build.sh — 编译 LaTeX 论文
# 可从任意目录运行，自动定位到 LaTeX 项目根目录
#
set -euo pipefail

# 定位脚本所在目录 → LaTeX 项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LATEX_DIR="$(dirname "$SCRIPT_DIR")"
MAIN="thuthesis-example"

cd "$LATEX_DIR"
echo "📂 Working: $(pwd)"

echo "🔨 xelatex (1/4)..."
xelatex -interaction=nonstopmode "$MAIN" > /dev/null 2>&1

echo "📚 bibtex (2/4)..."
bibtex "$MAIN" > /dev/null 2>&1

echo "🔨 xelatex (3/4)..."
xelatex -interaction=nonstopmode "$MAIN" > /dev/null 2>&1

echo "🔨 xelatex (4/4)..."
xelatex -interaction=nonstopmode "$MAIN" > /dev/null 2>&1

# 结果
PDF_SIZE=$(ls -lh "$MAIN.pdf" | awk '{print $5}')
OVERFULL=$(grep -c "Overfull" "$MAIN.log" 2>/dev/null || echo 0)
echo "✅ Done: $MAIN.pdf ($PDF_SIZE, $(grep 'Output written on' $MAIN.log | awk '{print $4}') pages, $OVERFULL overfull)"
