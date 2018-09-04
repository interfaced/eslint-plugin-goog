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
			`/**`,
			` * ns.one.two.thee.four`,
			` * @type {?}`,
			` */`,
			`const test = null;`
		)
	}],
	invalid: [{
		options: [{
			domains: [`ns`],
			knownNamespaces: [`ns.one`]
		}],
		code: `ns.one.two.thee.four();`,
		errors: errors(
			`Dependency "ns.one" is used but undeclared.`,
			`Undeclared dependencies: "ns.one".`
		),
		output: concat(
			`goog.require('ns.one');`,
			`ns.one.two.thee.four();`
		)
	}, {
		options: [{
			domains: [`ns`],
			knownNamespaces: [
				`ns.one`,
				`ns.one.Two`
			]
		}],
		code: concat(
			`ns.one.three();`,
			`new ns.one.Two();`
		),
		errors: errors(
			`Dependency "ns.one" is used but undeclared.`,
			`Undeclared dependencies: "ns.one", "ns.one.Two".`,
			`Dependency "ns.one.Two" is used but undeclared.`
		),
		output: concat(
			`goog.require('ns.one');`,
			`goog.require('ns.one.Two');`,
			`ns.one.three();`,
			`new ns.one.Two();`
		)
	}, {
		options: [{
			domains: [`ns`],
			knownNamespaces: [
				`ns.one`,
				`ns.one.Two`
			]
		}],
		code: concat(
			`goog.provide('pew')`,
			`ns.one.three();`,
			`pew = new ns.one.Two();`
		),
		errors: errors(
			`Undeclared dependencies: "ns.one", "ns.one.Two".`,
			`Dependency "ns.one" is used but undeclared.`,
			`Dependency "ns.one.Two" is used but undeclared.`
		),
		output: concat(
			`goog.provide('pew');`,
			`goog.require('ns.one');`,
			`goog.require('ns.one.Two');`,
			`ns.one.three();`,
			`pew = new ns.one.Two();`
		)
	}, {
		options: [{
			domains: [`ns`]
		}],
		code: `ns.one.two.thee.four();`,
		errors: errors(
			`Dependency "ns.one.two.thee.four" is used but undeclared.`
		)
	}, {
		options: [{
			domains: [`ns`]
		}],
		code: `ns.one.two.thee.four[ns.five.six] = null;`,
		errors: errors(
			`Dependency "ns.one.two.thee.four" is used but undeclared.`,
			`Dependency "ns.five.six" is used but undeclared.`
		)
	}, {
		options: [{
			domains: [`ns`]
		}],
		code: concat(
			`/**`,
			` * @type {ns.one.two.thee.four}`,
			` */`,
			`const test = null;`
		),
		errors: errors(
			`Dependency "ns.one.two.thee.four" is used but undeclared.`
		)
	}, {
		options: [{
			domains: [`ns`]
		}],
		code: concat(
			`/**`,
			` * @type {?ns.one.two.thee.four}`,
			` */`,
			`const test = null;`
		),
		errors: errors(
			`Dependency "ns.one.two.thee.four" is used but undeclared.`
		)
	}, {
		options: [{
			domains: [`ns`]
		}],
		code: concat(
			`/**`,
			` * @type {ns.one.two.thee.four|null}`,
			` */`,
			`const test = null;`
		),
		errors: errors(
			`Dependency "ns.one.two.thee.four" is used but undeclared.`
		)
	}, {
		options: [{
			domains: [`ns`]
		}],
		code: concat(
			`/**`,
			` * @type {Array<ns.one.two.thee.four>}`,
			` */`,
			`const test = null;`
		),
		errors: errors(
			`Dependency "ns.one.two.thee.four" is used but undeclared.`
		)
	}, {
		options: [{
			domains: [`ns`]
		}],
		code: concat(
			`/**`,
			` * @type {ns.one.two.thee.four<string>}`,
			` */`,
			`const test = null;`
		),
		errors: errors(
			`Dependency "ns.one.two.thee.four" is used but undeclared.`
		)
	}, {
		options: [{
			domains: [`ns`]
		}],
		code: concat(
			`/**`,
			` * @type {ns.one.two.thee.four.<string>}`,
			` */`,
			`const test = null;`
		),
		errors: errors(
			`Dependency "ns.one.two.thee.four" is used but undeclared.`
		)
	}, {
		options: [{
			domains: [`ns`]
		}],
		code: concat(
			`/**`,
			` * @type {function(ns.one.two.thee.four):void}`,
			` */`,
			`const test = null;`
		),
		errors: errors(
			`Dependency "ns.one.two.thee.four" is used but undeclared.`
		)
	}, {
		options: [{
			domains: [`ns`]
		}],
		code: concat(
			`/**`,
			` * @type {{key: ns.one.two.thee.four}}`,
			` */`,
			`const test = null;`
		),
		errors: errors(
			`Dependency "ns.one.two.thee.four" is used but undeclared.`
		)
	}, {
		options: [{
			domains: [`ns`]
		}],
		code: concat(
			`/**`,
			` * @type {{key1: ns.one.two.thee.four, key2: number}}`,
			` */`,
			`const test = null;`
		),
		errors: errors(
			`Dependency "ns.one.two.thee.four" is used but undeclared.`
		)
	}, {
		options: [{
			domains: [`ns`],
			excludedPatterns: [`thee.four`]
		}],
		code: concat(
			`/**`,
			` * @type {{key1: ns.one.two, key2: ns.thee.four}}`,
			` */`,
			`const test = null;`
		),
		errors: errors(
			`Dependency "ns.one.two" is used but undeclared.`
		)
	}, {
		options: [{
			domains: [`ns`],
			excludedPatterns: ['.+one.+']
		}],
		code: concat(
			`/**`,
			` * @type {{key1: ns.one.two, key2: ns.thee.four}}`,
			` */`,
			`const test = null;`
		),
		errors: errors(
			`Dependency "ns.thee.four" is used but undeclared.`
		)
	}]
};
