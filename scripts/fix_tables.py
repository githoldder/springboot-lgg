import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # chap03.tex
    if 'chap03' in filepath:
        content = content.replace(r'\begin{tabular}{llll}', r'\begin{tabular}{lllp{0.4\textwidth}}', 1)
        # Assuming table 3.2 is the second one, wait, table 3.2 text isn't that long, but just in case
        # we can replace the second {llll} as well
        content = content.replace(r'\begin{tabular}{llll}', r'\begin{tabular}{llp{0.35\textwidth}l}', 1)
    
    # chap04.tex
    if 'chap04' in filepath:
        content = content.replace(r'\begin{tabular}{lll}', r'\begin{tabular}{llp{0.6\textwidth}}', 1)
        
    # chap05.tex
    if 'chap05' in filepath:
        content = content.replace(r'\begin{tabular}{llll}', r'\begin{tabular}{lllp{0.4\textwidth}}', 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('docs/02-process/document/latex/分布式/data/chap03.tex')
fix_file('docs/02-process/document/latex/分布式/data/chap04.tex')
fix_file('docs/02-process/document/latex/分布式/data/chap05.tex')
