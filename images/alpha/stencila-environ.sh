#!/usr/bin/env bash

echo '{' \
	'{"r":' "$(R --slave -e 'stencila:::environ()' 2> /dev/null || echo "null")" '}' \
'}'
