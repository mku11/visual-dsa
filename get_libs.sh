#!/bin/bash -x
# script will download all dependency libraries needed for Visual DSA
# libaries:
# vis network library

CURRDIR=$(pwd)

VIS_NETWORK_URL=https://unpkg.com/vis-network/standalone/umd/vis-network.min.js
VIS_NETWORK_TARGET_DIR="./webview/assets/js"
curl $VIS_NETWORK_URL -LJo $VIS_NETWORK_TARGET_DIR/vis-network.min.js

cd $CURRDIR