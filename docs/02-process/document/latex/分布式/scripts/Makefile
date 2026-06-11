MAIN = thuthesis-example
LATEX_DIR = ..
LATEXMK = xelatex
BIBTEX = bibtex

.PHONY: all pdf clean cleanall view

all: pdf

pdf:
	cd $(LATEX_DIR) && \
	$(LATEXMK) -interaction=nonstopmode $(MAIN) && \
	$(BIBTEX) $(MAIN) && \
	$(LATEXMK) -interaction=nonstopmode $(MAIN) && \
	$(LATEXMK) -interaction=nonstopmode $(MAIN)
	@echo "=== Done: $$(ls -lh $(LATEX_DIR)/$(MAIN).pdf | awk '{print $$5}') ==="
	@grep -c "Overfull" $(LATEX_DIR)/$(MAIN).log 2>/dev/null || echo "0 overfull"

clean:
	cd $(LATEX_DIR) && \
	rm -f $(MAIN).aux $(MAIN).bbl $(MAIN).blg $(MAIN).fdb_latexmk \
	      $(MAIN).fls $(MAIN).log $(MAIN).out $(MAIN).toc $(MAIN).xdv \
	      $(MAIN).synctex.gz bu.aux

cleanall: clean
	cd $(LATEX_DIR) && rm -f $(MAIN).pdf

view:
	open $(LATEX_DIR)/$(MAIN).pdf
