'use strict';
var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
var ENCRYPTION_KEY = 32;
var IV_LENGTH = 16;
var  password = 'AbSoluTelly69ohnine';
var { base64encode, base64decode } = require('nodejs-base64');

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt,
  base64encode: base64encode,
  base64decode: base64decode
};

function encrypt(text){
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(JSON.stringify(text));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return base64encode(iv.toString('hex') + ':' + encrypted.toString('hex'));
}

function decrypt(text){
  let textParts = text.split(':');
  let iv = new Buffer(textParts.shift(), 'hex');
  let encryptedText = new Buffer(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(base64decode(decrypted.toString()));
}

