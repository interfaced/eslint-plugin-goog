const rules = require('../index').rules;
const RuleTester = require('eslint').RuleTester;

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
	ruleTester.run(ruleName, rules[ruleName], require('./' + ruleName));
});
