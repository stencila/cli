#!/usr/bin/env bash
#
# Testing functions to be sourced into individual test Bash scripts

# Prevent linter warnings by declaring variables 
# sourced from sibyl.sh
declare magenta
declare red
declare green
declare normal

# Testing functions

passes=0
fails=0

function test_ {
  echo
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

function finish {
  echo
  info "Passed: $green$passes$normal Failed: $red$fails$normal"

  exit $fails
}

# Assertion functions

function assert_empty {
  if [ "$1" == "" ]; then
    pass "Empty"
  else
    fail "Not empty: $1"
  fi
}

function assert_unempty {
  if [ "$1" != "" ]; then
    pass "Not empty: $1"
  else
    fail "Empty!"
  fi
}

function assert_equal {
  if [ "$1" == "$2" ]; then
    pass "Equal: $1"
  else
    fail "Not equal: $1 $2"
  fi
}

function assert_exists {
  if [ -e "$1" ]; then
    pass "Exists: $1"
  else
    fail "Does not exist: $1"
  fi
}

function assert_no_diff {
  diff_output=$(diff "$1" "$2")
  diff_status=$?
  if [ "$diff_status" == 0 ]; then
    pass "$1"
  else
    fail "Different: $1 $2"
    echo "$diff_output" | indent
  fi
}
