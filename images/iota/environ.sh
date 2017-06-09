#!/usr/bin/env sh

echo "{ \"node\":" $(node -e "require('stencila-node').environ()" 2> /dev/null || echo "null") "}"
