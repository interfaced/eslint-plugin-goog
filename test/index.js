const path = require('path');
const {RuleTester} = require('eslint');
const {rules} = require('../index');

const ruleTester = new RuleTester({
	parserOptions: {
		ecmaVersion: 6
	}
});

const ruleNames = [
	'no-undeclared-deps',
	'no-unused-deps',
	'no-duplicates',
	'right-order'
];

ruleNames.forEach((ruleName) => {
	// eslint-disable-next-line global-require
	ruleTester.run(ruleName, rules[ruleName], require(path.join(__dirname, 'rules', ruleName)));
});
