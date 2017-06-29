#!/usr/bin/env bash

if [ "${BASH_SOURCE[0]}" == "$0" ]; then
  source "../../sibyl.sh"
  source "../funcs.sh"
fi

launch .

# There should be container running using this image
assert_unempty "$(docker ps --filter="ancestor=$(image_id)" --quiet)"
