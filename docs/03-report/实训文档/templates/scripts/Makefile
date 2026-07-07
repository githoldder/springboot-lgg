MAIN ?= template
SCRIPT_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
LATEX_DIR := $(abspath $(SCRIPT_DIR)/..)
FINAL_PDF ?= /Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档/23030301曹磊-课程报告-答辩记录/5课程报告.pdf
LATEXMK = xelatex
BIBTEX = bibtex

.PHONY: all build pdf clean cleanall view

all: build

build: pdf

pdf:
	cd $(LATEX_DIR) && \
	$(LATEXMK) -interaction=nonstopmode $(MAIN) && \
	$(BIBTEX) $(MAIN) && \
	$(LATEXMK) -interaction=nonstopmode $(MAIN) && \
	$(LATEXMK) -interaction=nonstopmode $(MAIN)
	@mkdir -p "$$(dirname "$(FINAL_PDF)")"
	@cp $(LATEX_DIR)/$(MAIN).pdf "$(FINAL_PDF)"
	@echo "=== Done: $$(ls -lh $(LATEX_DIR)/$(MAIN).pdf | awk '{print $$5}') ==="
	@echo "pages: $$(sed -nE 's/^Output written on .*\(([0-9]+) pages\).*/\1/p' $(LATEX_DIR)/$(MAIN).log | tail -n 1)"
	@echo "overfull: $$(grep 'Overfull' $(LATEX_DIR)/$(MAIN).log 2>/dev/null | wc -l | tr -d ' ')"
	@$(MAKE) clean
	@echo "updated: $(FINAL_PDF)"

clean:
	cd $(LATEX_DIR) && \
	rm -f $(MAIN).aux $(MAIN).bbl $(MAIN).blg $(MAIN).fdb_latexmk \
	      $(MAIN).fls $(MAIN).log $(MAIN).out $(MAIN).toc $(MAIN).xdv \
	      $(MAIN).synctex.gz bu.aux

cleanall: clean
	cd $(LATEX_DIR) && rm -f $(MAIN).pdf

view:
	open $(LATEX_DIR)/$(MAIN).pdf
