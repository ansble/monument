var types = {
		'css': 'text/css'
		, 'js': 'application/js'
		, 'json': 'application/json'
		, 'jpg': 'image/jpeg'
		, 'jpeg': 'image/jpeg'
		, 'gif': 'image/gif'
		, 'svg': 'image/svg+xml'
	}
	, returnType = function (typeIn) {
		return types[typeIn];
	};

module.exports = returnType;