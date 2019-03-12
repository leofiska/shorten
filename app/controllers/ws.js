'use strict';
var fs = require('fs');
var operation = [];
var connected_peers = 0;

fs.readdir(__dirname + '/../operations/', function(err, files) {
  if (err) return;
  files.forEach(function(file) {
    var name = file.substr(0, file.indexOf('.'));
    console.log('loaded operation: ' + name);
    operation[name] = require(__dirname + '/../operations/' + file);
  });
});

exports.process = function(ws, req) {
  try {
    process( req, ws );
  } catch (e) {
    console.log('[' +
      req.connection.remoteAddress +
      '] something bad happened to this websocket');
    return;
  }
};

function process(req, ws) {
  var peer = req.connection.remoteAddress;
  ws._socket.setKeepAlive(true, 30000);
  connected_peers++;
  console.log('[' + peer + '] connected. Peers: ' + connected_peers);
  ws = {
    handler: ws,
    user: {
      username: '',
      email: '',
      id: '',
      permissions: '',
      is_admin: '',
      auth: {
        sid: '',
        keep: ''
      }
    },
    token: null,
    stoken: null,
    ltoken: null,
    send: function(msg) {
      try {
        if (this.handler.readyState === this.handler.OPEN)
          if (typeof msg === 'string' || msg instanceof String)
            this.handler.send(msg);
          else
            this.handler.send(JSON.stringify(msg));
      } catch (e) {
        console.log(e);
      }
    },
    close: function() {
      this.handler.close();
    },
  };
  ws.handler.on('message', function(msg) {
    // console.log('[' + req.connection.remoteAddress + '] ' + msg);
    try {
      try {
        var obj = JSON.parse(msg);
      } catch (e) {
        ws.send('Greetings from Server');
        return;
      }
      if (operation[obj.f] === undefined) {
        console.log('[' + peer + '] operation not found: ' + obj.f);
        ws.send({f: obj.f, error: 500, tid: obj.tid, content: {}});
      } else {
        console.log('[' + peer + '] function found: ' + obj.f);
        try {
          operation[obj.f].process(req, ws, obj);
        } catch (e) {
          console.log(e);
        }
      }
    } catch (e) {
      console.log('[' + peer +
        '] socket appears to be unresponsive, closing it');
      ws.close();
    }
  });
  ws.handler.on('close', function() {
    connected_peers--;
    console.log('[' + peer + '] disconnected. Peers: ' + connected_peers);
  });
  ws.handler.on('error', function() {
  });
};

