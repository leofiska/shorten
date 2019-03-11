var nodemailer = require('nodemailer');
var database = require(__dirname + '/../resource/database.js');
var base = require(__dirname + '/../resource/base.js');
var sentences = require(__dirname + '/../resource/sentence.js');
var crypto = require('crypto');
var config = require(__dirname + '/../resource/config.js');
var transporter = nodemailer.createTransport(config.email);

module.exports = {
  schedule_email: schedule_email,
  send_email: send_email
}

var mailOptions = {
  from: 'no-reply@rd-a.xyz',
};

var signature = '';

/*transporter.sendMail (mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});*/

async function schedule_email (to, subject, content, html, language, signature) {
  if (html === undefined || html === null) html = true;
  if (signature === undefined || signature === null) signature = true;
  if (language === undefined || language === null) language = 1033;
  try {
    var query = 'INSERT INTO tb_emails ( email_subject, email_from, email_reply_to, email_html, email_text, email_language, email_signature ) VALUES '+
              '( \''+subject+'\', \'no-reply@rd-a.xyz\', \'leonardo.fischer@atos.net\', true, \''+content.replace('\'','\'\'')+'\', (SELECT language_id FROM tb_languages WHERE language_codeset=REGEXP_REPLACE(COALESCE(\''+language+'\', \'0\'), \'[^0-9]*\' ,\'0\')::integer OR language_code=\''+language+'\' LIMIT 1), true ) RETURNING email_id';
    var res = await database.pg_query(query);
    if (res.rows[0] === undefined) return false;
    if (to.email !== undefined) {
      query = 'INSERT INTO tb_email_to ( email_to_email_id, email_to_name, email_to_email ) VALUES '+
              '( '+res.rows[0].email_id+', \''+to.name+'\', \''+to.email+'\' )';
    } else {
      query = 'INSERT INTO tb_email_to ( email_to_email_id, email_to_email ) VALUES '+
              '( '+res.rows[0].email_id+', \''+to+'\' )';
    }
    await database.pg_query(query);
  } catch (e) {
    console.log(e);
    return false;
  }
  return true;
}

async function send_email( row ) {
  var configuration = await config.variables;
  var sequency = {};
  // var boundary = crypto.createHash('md5').update(''+Math.floor(Date.now() / 1000)).digest('hex');

  var mailOptions = {
    from: row.email_from,
    replyTo: row.email_reply_to,
    to: row.email_to.join(', '),
    subject: 'rd-a.xyz - ' + row.email_subject,
    textEncoding: 'base64'
  }
  if (row.email_html === true) {
    mailOptions.html = '<html>\r\n<head>\r\n'+
          ' <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\r\n'+
          '<style type="text/css">\r\n'+
          '@font-face {\r\n'+
          '  font-family: PTSans;\r\n'+
          '  font-weight: normal;\r\n'+
          '  src: url(https://'+configuration['system|url']+'/fonts/PT_Sans-Web-Regular.ttf);\r\n'+
          '}\r\n'+
          '* {\r\n'+
          '  font-family: "PTSans", Segoe UI, Calibri, Verdana, Arial !important;\r\n'+
          '  color: #000000 !important;\r\n'+
          '  text-decoration: none !important;\r\n'+
          '}\r\n'+
          'body {\r\n'+
          '  background-color: #ffffff !important;\r\n'+
          '}\r\n'+
          'a:link, a:hover, a:active, a:visited {\r\n'+
          '  color: inherit !important;\r\n'+
          '  font-weight: inherit !important;\r\n'+
          '  cursor: pointer !important;\r\n'+
          '}\r\n'+
          '.iglow4 {\r\n'+
          '  filter: alpha(opacity=1);\r\n'+
          '  opacity: 1;\r\n'+
          '  transition: opacity 0.4s ease-in 0s !important;\r\n'+
          '  -webkit-transition: opacity 0.4s ease-in 0s !important;\r\n'+
          '  -o-transition: opacity 0.4s ease-in 0s !important;\r\n'+
          '  -moz-transition: opacity 0.4s ease-in 0s !important;\r\n'+
          '}\r\n'+
          '.iglow4:hover {\r\n'+
          '  filter: alpha(opacity=0.4);\r\n'+
          '  opacity: 0.4;\r\n'+
          '}\r\n'+
          'img.bigicon {\r\n'+
          '  height: 20px !important;\r\n'+
          '  width: 20px !important;\r\n'+
          '  margin-right: 3px !important;\r\n'+
          '}\r\n'+
          '</style>\r\n'+
          '</head>\r\n<body>\r\n';
    mailOptions.html += row.email_text;
//    mailOptions.headers = { 'Content-Type': 'text/html; charset=UTF-8' };
    if (row.email_signature === true) {
     sequency = await sentences.get_sequency('SIGNATURE', row.language);
     mailOptions.html += '<br /><br />\r\n'+
       sequency.yours_truly+',\r\n'+
       "<div style=\"height: 10px\"></div><div style='display: table;'>\r\n"+
       "<div style='display: table-row'>\r\n"+
       "<div style='display: table-cell;  vertical-align: middle;'>\r\n"+
       "<img style='height: 90px' src='https://"+configuration['system|url']+"/favicons/favicon-96x96.png' />\r\n"+
       "</div>\r\n"+
       "<div style='display: table-cell; vertical-align: middle;'>\r\n"+
       "<div style='display: inline-block; margin-left: 20px; padding: 5px 0px 10px 20px; border-left: 2px solid black'>\r\n"+
       "<div style='font-weight: bold; padding-bottom: 5px;'>"+configuration['contact|name']+"</div>\r\n"+
       "<div style=''>"+sequency.developer+", <a class='iglow4' style='color: inherit !important;font-weight: inherit !important;cursor: pointer !important;' href='https://"+configuration['system|url']+"' target='_blank'>"+configuration['system|url']+"</a></div>\r\n"+
       "<div style='padding-bottom: 5px;'>"+configuration['contact|phone']+"</div>\r\n"+
       "<div>"+
//       "<a style='color: inherit !important;font-weight: inherit !important;cursor: pointer !important;' href='https://"+configuration['system|url']+"' target='_blank'><img class='bigicon' style='height: 20px !important;width: 20px !important;margin-right: 3px !important;' src='https://"+configuration['system|url']+"/favicons/favicon-96x96.png' /></a>"+
       "\r\n";
      for (var item in configuration) {
        var pos = item.indexOf('social_');
        if (pos === -1) continue;
        mailOptions.html += "<a href='"+configuration[item]+"' target='_blank'><img class='bigicon' src='https://"+configuration['system|url']+"/pictures/"+item.toLoweCase()+".png' /></a>\r\n";
      }
      mailOptions.html += '</div>\r\n'+
                          '</div>\r\n'+
                          '</div>\r\n'+
                          '</div>\r\n'+
                          '</div>\r\n';
      mailOptions.html += '</body>\r\n</html>\r\n';
    }
  } else {
    mailOptions.text = row.email_text;
  }
  //mailOptions.html = base.base64encode(mailOptions.html);
  try {
    var ret = await transporter.sendMail(mailOptions);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
//  console.log(mailOptions);
}

