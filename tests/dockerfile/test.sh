#!/usr/bin/env bash

if [ "${BASH_SOURCE[0]}" == "$0" ]; then
  source "../../sibyl.sh"
  source "../funcs.sh"
fi

launch

# Shouldn't be anything in sibyl folder
assert_exists .sibyl
assert_empty "$(ls -1 .sibyl)"

# There should be container running using this image
assert_unempty "$(docker ps --filter="ancestor=$(image_id)" --quiet)"
