const fs = require('fs');

var code = fs.readFileSync("./clientModule.js").toString();

eval(code);

hackFunc();