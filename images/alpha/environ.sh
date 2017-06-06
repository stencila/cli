#!/usr/bin/env bash

echo -e '{\n' \
	'"node":' "$(node -e "require('stencila-node').environ()" 2> /dev/null || echo "null")" ',\n' \
	'"py":' "$(python -c "import stencila; stencila.environ()" 2> /dev/null || echo "null")" ',\n' \
	'"r":' "$(R --slave -e "stencila:::environ()" 2> /dev/null || echo "null")" '\n' \
'}\n' | jq .
