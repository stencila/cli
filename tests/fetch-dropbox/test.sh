#!/usr/bin/env bash

if [ "${BASH_SOURCE[0]}" == "$0" ]; then
  source "../../sibyl.sh"
  source "../funcs.sh"
fi

fetch "dropbox://el77xzcpr9uqxb1/AABJIkDNXo_-sKnrUtQvCxC4a"

# Assert that files are present
assert_exists "bundles/dropbox-el77xzcpr9uqxb1-aabjikdnxo-sknrutqvcxc4a-7d3e79a8f6/main.md"
assert_exists "bundles/dropbox-el77xzcpr9uqxb1-aabjikdnxo-sknrutqvcxc4a-7d3e79a8f6/my-data.csv"
