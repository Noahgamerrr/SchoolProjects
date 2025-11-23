#!/bin/sh

getRawFilenameNoExtension() {
    echo $1 | sed 's/.*\///' | sed 's/\..*//'
}

echo "# Use-Case Tables" > $2
echo >> $2

find $1 -type f -name '*.md' -print | sort | while read filename; do
    echo "##" $(getRawFilenameNoExtension $filename)
    echo "\\small"
    cat "$filename"
    echo "\\normalsize"
    echo "\\pagebreak"
done >> $2