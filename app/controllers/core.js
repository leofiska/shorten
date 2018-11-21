'use strict';
var base = require('../resource/base.js');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var database = require(__dirname + '/../resource/database.js');
/* eslint-disable no-new */
var {ObjectId} = require('mongodb');
var safeObjectId = s => ObjectId.isValid(s) ? new ObjectId(s) : null;

const extensions = {
  loadInBrowser: [ 'image', 'video', 'text' ]
}

exports.resource = ( req , res ) => {
  if ( req.header('host') == undefined ) {
    res.statusCode = 404;
    res.end();
    return;
  }
  provide_resource(req, res);
};

exports.vueresource = ( req , res ) => {
  if ( req.header('host') == undefined ) {
    res.statusCode = 404;
    res.end();
    return;
  }
  provide_vueresource(req, res);
};

exports.redirect = ( req, res ) => {
  console.log('redirect');
  if ( req.header('host') == undefined ) {
    res.statusCode = 404;
    res.end();
    return;
  }
  database.client.connect(database.url, { useNewUrlParser: true },
    function(err, db) {
      setTimeout(destroy.bind(this), 30000, db);
      if (err) {
        res.statusCode = 500;
        res.end();
        return;
      }
      var dbo = db.db(database.db);
      var query = { short_url: req.params.shorten };
      dbo.collection('urls').findOne(query, function(err, doc) {
        if (err || doc == null) {
          res.statusCode = 404;
          res.end();
          return;
        }
        res.writeHead(301, {
          'Location': doc.url
        });
        res.end();
      });
    });
};

function provide_vueresource( req, res ) {
  var file = __dirname+'/../../dist/index.html';
  if ( req.path != '/' ) {
    file = __dirname+'/../../dist'+req.path;
  }
  console.log('requesting vue-resource: '+file);
  fs.exists(file, function(exists) {
    if ( exists ) {
      provide_file( req, res, file );
    } else {
      console.log('404');
      res.statusCode = 404;
      res.end();
    }
  });
};

function provide_resource( req, res ) {
  console.log('requesting resource: '+file);
  var file = __dirname+'/../../media/'+req.params.folder+'/'+req.params.file;
  fs.exists(file, function(exists) {
    if ( exists ) {
      provide_file( req, res, file );
    } else {
      console.log('404');
      res.statusCode = 404;
      res.end();
    }
  });
};

function provide_file( req, res, file ) {
  console.log('encontrou:'+file);
  var ext = path.extname(file).substr(1).toLowerCase();
  var mimeType = mime.getType(file);
  // force download
  if ( (req.query.d != undefined && req.query.d == 1) || (extensions.loadInBrowser.indexOf(ext) == -1 && extensions.loadInBrowser.indexOf(mimeType.substr(0,mimeType.indexOf('/'))) == -1) ) {
    res.setHeader('Content-disposition','attachment; filename="'+req.url.substring(req.path.lastIndexOf('/')+1)+'"' );
  } else {
    res.setHeader('Content-disposition','filename="'+file.substring(file.lastIndexOf('/')+1)+'"' );
  }
  var stat = fs.stat(file, function(err,stats) {
    if ( err ) {
      res.statusCode = 500;
      res.end();
      return;
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
     var stream = fs.createReadStream(file, { start: info.start, end: info.end, bufferSize: bufferSize });
    stream.on('open', function() {
      stream.pipe(res);
    });

    stream.on('end', function() {
      stream.destroy();
      res.end();
    });
  });
}
function destroy(con) {
  if (con !== undefined && con !== null) {
    con.close();
    con.destroy;
    con = null;
  }
};
