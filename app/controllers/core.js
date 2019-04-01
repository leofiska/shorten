'use strict';
var fs = require('fs')
var path = require('path')
var mime = require('mime')
var database = require(__dirname + '/../resource/database.js');
var uuid = require('short-uuid');
var translator = uuid();
/* eslint-disable no-new */
var {ObjectId} = require('mongodb');

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
exports.faviconresource = ( req , res ) => {
  if ( req.header('host') == undefined ) {
    res.statusCode = 404;
    res.end();
    return;
  }
  provide_faviconresource(req, res);
};

exports.redirect = async ( req, res ) => {
  console.log('redirect: '+req.params.shorten);
  if ( req.header('host') === undefined ) {
    res.statusCode = 404;
    res.end();
    return;
  }
  try {
    var query = 'SELECT short_id, short_url FROM tb_shortener WHERE short_uuid=\''+translator.toUUID(req.params.shorten)+'\' LIMIT 1';
    var ans = await database.query(query);
    if (ans === null) {
      res.statusCode = 500;
      res.end();
      return;
    }
    if (ans.rowCount !== 1) {
      res.statusCode = 404;
      res.end();
      return;
    }
    query = 'UPDATE tb_shortener SET short_unique_counter = short_unique_counter + 1 WHERE short_id='+ans.rows[0].short_id;
    await database.query(query);
    res.writeHead(301, {
      'Location': ans.rows[0].short_url
    });
  } catch (e) {
    console.log('invalid redirect request: ' +req.params.shorten);
    writeError(res, 404);
  }
  res.end();
};

function provide_vueresource( req, res ) {
  var file = __dirname+'/../../dist/index.html';
  if ( req.path != '/' ) {
    file = __dirname+'/../../dist'+req.path;
  }
  console.log('requesting vue-resource: '+file);
  fs.exists(file, function(exists) {
    console.log('epa1');
    if ( exists ) {
      provide_file( req, res, file );
    } else {
      console.log('epa2');
      console.log('404');
      res.statusCode = 404;
      res.end();
    }
  });
};

function provide_resource( req, res ) {
  var file = __dirname+'/../../media/'+req.params.folder+'/'+req.params.file;
  console.log('requesting resource: '+req.params.folder+'/'+req.params.file);
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

function provide_faviconresource( req, res ) {
  console.log('requesting favicon: '+req.params[0]);
  var file = __dirname+'/../../media/favicons/'+req.params[0];
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
  console.log('here');
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
    try {
      console.log('going');
      var stream = fs.createReadStream(file, { start: info.start, end: info.end, bufferSize: bufferSize });
      stream.on('open', function() {
        try {
          stream.pipe(res);
        } catch (e) {
          console.log('something went wrong');
        }
      });
      stream.on('end', function() {
        stream.destroy();
        res.end();
      });
    } catch (e) {

    }
  });
}
function destroy(con) {
  if (con !== undefined && con !== null) {
    con.close();
    con.destroy;
    con = null;
  }
};

function writeError (res, error) {
  switch(error) {
    case 404:
      res.setHeader('Content-Type','text/html; charset=utf8' );
      res.writeHead(404);
      res.statusCode = 404;
      break;
    case 500:
    default:
      res.setHeader('Content-Type','text/html; charset=utf8' );
      res.writeHead(500);
      res.statusCode = 500;
      break;
  }
}

function templateError () {
  var ret = '<html>\r\n'+
    '  <head>\r\n'+
    '  </head>\r\n'+
    '  <body>\r\n'+
    '  </body>\r\n'+
    '</html>\r\n';
  return ret;
}

