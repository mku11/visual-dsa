@ECHO ON
set CURRDIR=%CD%

:: script will download all dependency libraries needed for Visual DSA
:: libaries:
:: vis network library

set VIS_NETWORK_URL=https://unpkg.com/vis-network/standalone/umd/vis-network.min.js
set VIS_NETWORK_TARGET_DIR=".\\webview\\assets\\js"
curl %VIS_NETWORK_URL% -LJo %VIS_NETWORK_TARGET_DIR%\vis-network.min.js

cd %CURRDIR%