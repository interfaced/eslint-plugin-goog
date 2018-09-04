const errors = require(`./helper`).errors;
const concat = require(`./helper`).concat;

module.exports = {
	valid: [{
		code: concat(
			`goog.require('ns.one.two.thee.four');`,
			`ns.one.two.thee.four();`
		)
	}],
	invalid: [{
		code: concat(
			`goog.require('ns.one.two.thee.four');`,
			`goog.require('ns.one.two.thee.four');`,
			`ns.one.two.thee.four();`
		),
		output: concat(
			`goog.require('ns.one.two.thee.four');\n;`,
			`ns.one.two.thee.four();`
		),
		errors: errors(
			`Duplicate namespace "ns.one.two.thee.four".`
		)
	}]
};
