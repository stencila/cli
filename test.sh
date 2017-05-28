#!/usr/bin/env bash

. sibyl.sh sourced

# Prevent linter warnings by declaring variables 
# sourced from main script
declare magenta
declare red
declare green
declare normal

# Testing functions

passes=0
fails=0

function test_ {
  echo -e "${magenta}TEST${normal} $1"
}

function pass {
  echo -e "${green}PASS${normal} $1"
  passes=$(( passes + 1 ))
}

function fail {
  echo -e "${red}FAIL${normal} $1"
  fails=$(( fails + 1 ))
}

# Assertion functions

function assert_no_diff {
  diff_output=$(diff "$1" "$2")
  diff_status=$?
  if [ "$diff_status" == 0 ]; then
    pass "$1"
  else
    fail "$1"
    echo "$diff_output" | indent
  fi
}

# Iterate over test folders

for dir in tests/*/
do
  test_ "$(basename "$dir")"
  cd "$dir"

  # If `origin` is defined then `fetch`
  origin=$(property origin)
  if [ "$origin" != "null" ]; then
    fetch "$origin"
  fi
  # Compile
  compile

  # Test files are as expected
  for file in *.expected; do
    assert_no_diff "${file%.*}" "$file"
  done

  cd ../..
  
  echo
done

# Overall stats

info "Passed: ${green}$passes${normal} Failed: ${red}$fails${normal}"

exit $fails
