module.exports.rules = {
	'no-undeclared-deps': require('./lib/rules/no-undeclared-deps'),
	'no-unused-deps': require('./lib/rules/no-unused-deps'),
	'no-duplicates': require('./lib/rules/no-duplicates'),
	'right-order': require('./lib/rules/right-order')
};

module.exports.nsUtils = require('./scripts/ns-utils');
