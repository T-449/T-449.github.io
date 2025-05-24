#!/bin/bash

# Ensure a filename is provided
if [ -z "$1" ]; then
  echo "Usage: ./compile.sh filename.tex"
  exit 1
fi

# Get the base name (without .tex)
basename="${1%.tex}"

# Compile to PDF
latexmk -pdf "$1" || exit 1

# Clean up aux files
latexmk -c "$1"

# Move PDF to ../files
mkdir -p ../files
mv "${basename}.pdf" ../files/

echo "PDF moved to ../files/${basename}.pdf"

