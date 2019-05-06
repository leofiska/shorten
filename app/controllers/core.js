'use strict';
var base = require('../resource/base.js');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var database = require(__dirname + '/../resource/database.js');
var zlib = require('zlib');

const extensions = {
  loadInBrowser: [ 'image', 'video', 'text' ]
}

exports.vueresource = ( req , res ) => {
  return provide(req, res, 'dist/');
}

exports.mediaresource = ( req , res ) => {
  return provide(req, res, 'media/');
}

exports.faviconresource = ( req , res ) => {
  return provide(req, res, 'media/favicons/');
}

exports.resource = ( req , res ) => {
  return provide(req, res,'');
}

function provide (req, res, base) {
  if (base === undefined) {
    base = '';
  }
  
  var file = base+'index.html';
  if (req.path !== '/') {
    file = base+req.path.substr(1);
  }
  
  if ( !fs.existsSync(file) ) {
    console.log('not found: '+file);
    res.statusCode = 404;
    res.end();
    return;
  }
  
  var stats = fs.statSync(file);
  var ext = path.extname(file).substr(1).toLowerCase();
  var mimeType = mime.getType(file);
  var acceptEncoding = req.headers['accept-encoding'];

  // force download
  if ( (req.query.d != undefined && req.query.d == 1) || (extensions.loadInBrowser.indexOf(ext) == -1 && extensions.loadInBrowser.indexOf(mimeType.substr(0,mimeType.indexOf('/'))) == -1) ) {
    res.setHeader('Content-disposition','attachment; filename="'+req.url.substring(req.path.lastIndexOf('/')+1)+'"' );
  } else {
    res.setHeader('Content-disposition','filename="'+file.substring(file.lastIndexOf('/')+1)+'"' );
  }
  var info = { start: 0, end: (stats.size-1), total: stats.size, chunk: (stats.size) };

  if ( req.headers['range'] != undefined ) {
    var range = req.headers['range'].substr(req.headers['range'].indexOf('=')+1).split('-');
    try {
      info.start = ( range[0] != undefined && range[0] != '' ) ? parseInt(range[0],10) : info.start;
    } catch ( e) {
      info.start = 0;
    }
    try {
      info.end = ( range[1] != undefined && range[1] != '' ) ? parseInt(range[1],10) : info.end;
    } catch ( e ) {
      info.end = (stats.size-1);
    }
    info.chunk = info.total-info.start;
    res.setHeader('Content-Type', mimeType );
    res.setHeader('Content-Range', 'bytes '+info.start+'-'+info.end+'/'+info.total);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-length',info.chunk);
    res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    //console.log('range: '+info.start+'-'+info.end+'/'+info.total);
    res.statusCode = 206;
  } else {
    res.setHeader('Content-length',info.total);
    if (acceptEncoding.match(/\bgzip\b/)) {
      res.setHeader('Content-Encoding', 'gzip');
    } else if (acceptEncoding.match(/\bdeflate\b/)) {
      res.setHeader('Content-Encoding', 'deflate');
    }
    switch(ext) {
      case 'html':
      case 'vtt':
        res.setHeader('Content-Type', mimeType+'; charset=utf8' );
        res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.setHeader('Accept-Ranges', 'none');
        break;
      default:
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Type', mimeType );
        res.setHeader('Expires', new Date(Date.now() + 2592000000).toUTCString() );
        res.setHeader('Cache-Control', 'max-age=604800, private' );
        res.setHeader('Pragma','cache' );
        break;
    }
    res.statusCode = 200;
  }
  var bufferSize = 64*1024;
  if ( info.chunk < bufferSize ) bufferSize = info.chunk;
  var raw = fs.createReadStream(file, { start: info.start, end: info.end, bufferSize: bufferSize });
  //var raw = fs.createReadStream(file, { start: info.start, end: info.end });
  if (acceptEncoding.match(/\bgzip\b/)) {
    raw.pipe(zlib.createGzip()).pipe(res);
  } else if (acceptEncoding.match(/\bdeflate\b/)) {
    raw.pipe(zlib.createDeflate()).pipe(res);
  } else {
    raw.pipe(res);
  }

  //raw.on('end', function() {
  //  raw.destroy();
  //  res.end();
  //});
}

function destroy(con) {
  if (con !== undefined && con !== null) {
    con.close();
    con.destroy;
    con = null;
  }
};

