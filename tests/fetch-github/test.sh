#!/usr/bin/env bash

if [ "${BASH_SOURCE[0]}" == "$0" ]; then
  source "../../sibyl.sh"
  source "../funcs.sh"
fi

# Fetch a github repo
fetch "github://stencila/test"

# Assert that dirs and files are present
assert_exists "bundles/github-stencila-test-500533b596"
assert_exists "bundles/github-stencila-test-500533b596/README.md"
assert_exists "bundles/github-stencila-test-500533b596/.travis.yml"


# Fetch a github repo subdirectory
fetch "github://stencila/test/sub"

# Assert that dirs and files are present
assert_exists "bundles/github-stencila-test-sub-b1bb2b173c"
assert_exists "bundles/github-stencila-test-sub-b1bb2b173c/README.md"
assert_equal "$(cat bundles/github-stencila-test-sub-b1bb2b173c/README.md)" "Hello from the subdirectory \`sub\`!"
