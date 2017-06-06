#!/usr/bin/env bash

source "../sibyl.sh"
source "funcs.sh"

# Function tests (tests of functions that can be defined here)

test_ "bundle_name"
assert_equal "$(bundle_name "file://folder/subfolder")" "file-folder-subfolder-4329642ba3"
assert_equal "$(bundle_name "github://foo/bar/folder/subFOLDER")" "github-foo-bar-folder-subfolder-a022134984"
assert_equal "$(bundle_name "file://home/user/Esperança-vôo-avião")" "file-home-user-esperanca-voo-aviao-2169b6d973"

# Folder tests (tests that run in a directory)

for dir in $(find . -mindepth 1 -maxdepth 1 -type d -not -path '*-skip' | sort)
do
  test_ "$(basename "$dir")"
  pushd "$dir" > /dev/null

  if [ -e test.sh ]; then 
    # If there is a `test.sh` in the folder then run that
    # using `source` so that passes and fails get updated
    source test.sh
  else
    # If there is a `.build` file in the folder
    # then do a build, otherwise just a compile
    if [ -e ".build" ]; then
      build
    else
      compile
    fi
    # Assert that files are as expected
    for file in .sibyl/*.expected; do
      assert_no_diff "${file%.*}" "$file"
    done
  fi

  popd > /dev/null
done

# Exit with number of fails
finish
