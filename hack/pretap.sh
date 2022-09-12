#!/bin/bash
set -ex

rm -f ./tsconfig.json
ln -s ./tsconfig.tap.json ./tsconfig.json
