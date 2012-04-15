const bcrypt = require('bcrypt');

process.on('message', function(m) {
  var salt = bcrypt.genSaltSync(12);  
  var hash = bcrypt.hashSync("B4c0/\/", salt);
  process.send({});
});
