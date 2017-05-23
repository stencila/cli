#!/usr/bin/env bash

. sibyl sourced

# Testing functions

passes=0
fails=0

function test_ {
  printf "${magenta}TEST${normal} $1\n"
}

function pass {
  printf "${green}PASS${normal} $1\n"
  passes=$(($passes + 1))
}

function fail {
  printf "${red}FAIL${normal} $1\n"
  fails=$(($fails + 1))
}

# Assertion functions

function assert_no_diff {
  diff_output=$(diff $1 $2)
  diff_status=$?
  if [ "$diff_status" == 0 ]; then
    pass $1
  else
    fail $1
    echo "$diff_output" | indent
  fi
}

# Iterate over test folders

for dir in tests/*/
do
  test_ $(basename $dir)
  cd $dir
  
  compile
  for file in $(ls -1 *.expected); do
    assert_no_diff "${file%.*}" "$file"
  done

  cd ../..
  
  echo
done

# Overall stats

info "Passed: ${green}$passes${normal} Failed: ${red}$fails${normal}"

exit $fails
