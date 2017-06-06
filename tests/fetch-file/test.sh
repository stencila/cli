#!/usr/bin/env bash

if [ "${BASH_SOURCE[0]}" == "$0" ]; then
  source "../../sibyl.sh"
  source "../funcs.sh"
fi

# Bundle path needs to use an absolute path
bundle_path_="$PWD/hello"
bundle_address_="file://$bundle_path_"

# Create a bundle on the filesystem to fetch
mkdir -p "$bundle_path_"
echo "Hello world!" > "$bundle_path_/main.md"

# Fetch it!
fetch "$bundle_address_"

# Assert that dirs and files are present
bundle_name_=$(bundle_name "$bundle_address_")
assert_exists "bundles/$bundle_name_"
assert_exists "bundles/$bundle_name_/main.md"
