var path = require('path')
	, normalizedPath = path.join(__dirname)
	, fs = require('fs');

fs.readdirSync(normalizedPath).forEach(function(file) {
  if(file !== 'index.js'){
  	require("./" + file);
  }
});