# Light URL shortener

> This is a light weight, free of ads and tracking, URL Shortener using vue.js project.
> It uses websocket and MongoDB as database

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# script to start back-end
#!/bin/bash
SPATH=`pwd -P`/`dirname $0`
if [ ! -d "$SPATH" ]; then
  SPATH=`dirname $0`/
fi

cd /var/www/vhosts/project-1/
while [ true ]; do
  nodemon -x '../node/bin/node server.js || sleep 1 && touch server.js'
done

```
