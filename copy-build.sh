!#/bin/bash

npm run build

TARGET=/var/www/html/apprepository/vhvWs/

mv dist vhvWs

cp -rf vhvWs/* $TARGET 
