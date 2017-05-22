#!/usr/bin/env bash

# Installs https://github.com/SimonKagstrom/kcov on the system for
# code coverage of Bash scripts. Used for local dev setup and on Travis CI buillds

wget https://github.com/SimonKagstrom/kcov/archive/master.tar.gz &&
tar xzf master.tar.gz &&
cd kcov-master &&
mkdir build &&
cd build &&
cmake .. &&
make &&
sudo make install &&
cd ../.. &&
rm -rf kcov-master
