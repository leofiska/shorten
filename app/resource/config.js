var database = require(__dirname + '/../resource/database.js');
var config = require('../../config/config.json');

var variables = get_variables();

module.exports = {
  variables: variables,
  email: config.email,
  update_variables: update_variables
}

async function get_variables () {
  try {
    var query = 'SELECT json_build_object(\'name\', config_name, \'value\', config_value) as config FROM tb_config';
    var res = await database.query(query);
    var els = [];
    for (var i = 0; res.rows[i] !== undefined; i++) {
      els[res.rows[i].config.name] = res.rows[i].config.value;
    }
    return els;
  } catch (e) {
    return null;
  }
}

function update_variables () {
  variables = get_variables();
}

