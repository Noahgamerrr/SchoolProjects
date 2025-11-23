#!/bin/sh

rm pflichtenheft.pdf
sh pandoc/merge_puml.sh ActivityDiagram /tmp/activity-diagrams.md
sh pandoc/merge_usecase_tables.sh UseCaseTables /tmp/usecase-tables.md
pandoc --listings \
       --resource-path . \
       --toc \
       --number-sections \
       --template eisvogel.tex \
       --filter pandoc-plantuml \
       -f markdown+multiline_tables+escaped_line_breaks \
       meta.yml \
       README.md \
       pandoc/use_case_diagram.md \
       /tmp/usecase-tables.md \
       pandoc/domain_model.md \
       /tmp/activity-diagrams.md \
       -o pflichtenheft.pdf
rm -rf plantuml-images
rm /tmp/activity-diagrams.md
rm /tmp/usecase-tables.md
