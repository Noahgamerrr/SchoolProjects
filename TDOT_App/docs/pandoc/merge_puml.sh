#!/bin/sh
cutNotNamePuml() {
    echo $1 | sed 's/.*\///' | sed 's/\..*//'
}

echo "# Activity Diagrams" > $2
echo >> $2

find $1 -type f -name '*.puml' -print | sort | while read filename; do
    echo "##" $(cutNotNamePuml $filename)
    echo
    echo "\`\`\`{ .plantuml height=90% }"
    cat "$filename"
    echo
    echo "\`\`\`"
done >> $2

# Remove @startuml description, as it breaks the plantuml render
sed -i 's/@startuml.*/@startuml/g' $2