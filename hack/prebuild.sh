#!/bin/bash
set -ex

rm -f ./tsconfig.json
ln -s ./tsconfig.build.json ./tsconfig.json
