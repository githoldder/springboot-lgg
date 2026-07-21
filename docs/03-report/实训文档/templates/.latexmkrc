# latexmk configuration for thuthesis
# Usage: latexmk -xelatex template

# Use XeLaTeX as the PDF engine
$pdf_mode = 5;          # 5 = xelatex
$xelatex = 'xelatex -interaction=nonstopmode -synctex=1 %O %S';

# BibTeX configuration
$bibtex_use = 2;        # 1 = run bibtex when .bib files change; 2 = always run when needed

# Maximum number of runs (safety limit)
$max_repeat = 5;

# Output directory (same as source)
$out_dir = '.';

# Clean extensions
$clean_ext = 'synctex.gz synctex(busy) run.xml bbl bcf fdb_latexmk fls';
