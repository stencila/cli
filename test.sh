#!/usr/bin/env bash

. sibyl

for dir in tests/*/
do
    echo "Running test ${dir}"
    cd $dir
    compile
    cd ../..
    echo
done
