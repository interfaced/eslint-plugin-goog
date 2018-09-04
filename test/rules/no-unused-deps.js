const errors = require(`../helper`).errors;
const concat = require(`../helper`).concat;

module.exports = {
	valid: [{
		options: [{
			domains: [`ns`]
		}],
		code: concat(
			`goog.require('ns.one.two.thee.four');`,
			`ns.one.two.thee.four();`
		)
	}, {
		options: [{
			domains: [`ns`]
		}],
		code: concat(
			`goog.require('ns.one.two.thee.four');`,
			`/**`,
			` * @type {ns.one.two.thee.four}`,
			` */`,
			`const test = null;`
		)
	}],
	invalid: [{
		options: [{
			domains: [`ns`]
		}],
		code: concat(
			`goog.require('ns.one.two.thee.four');`,
			`goog.require('ns.one.two.thee.five');`,
			`ns.one.two.thee.four();`
		),
		output: concat(
			`goog.require('ns.one.two.thee.four');;`,
			`ns.one.two.thee.four();`
		),
		errors: errors(
			`Dependency "ns.one.two.thee.five" is declared but never used.`
		)
	}, {
		options: [{
			domains: [`ns`]
		}],
		code: `goog.require('ns.one.two.thee.four');`,
		output: `;`,
		errors: errors(
			`Dependency "ns.one.two.thee.four" is declared but never used.`
		)
	}, {
		options: [{
			domains: [`ns`]
		}],
		code: concat(
			`goog.require('ns.one.two.thee.four');`,
			`/**`,
			` * ns.one.two.thee.four`,
			` * @type {?}`,
			` */`,
			`const test = null;`
		),
		output: concat(
			`;`,
			`/**`,
			` * ns.one.two.thee.four`,
			` * @type {?}`,
			` */`,
			`const test = null;`
		),
		errors: errors(
			`Dependency "ns.one.two.thee.four" is declared but never used.`
		)
	}]
};
