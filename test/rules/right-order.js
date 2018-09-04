const errors = require('../helper').errors.bind(null, 'There are some expressions order problems.');
const concat = require('../helper').concat;

module.exports = {
	valid: [{
		code: concat(
			`goog.require('ns.one.two.thee.four');`
		)
	}, {
		code: concat(
			`goog.provide('ns.one.two.thee.four');`
		)
	}, {
		code: concat(
			`goog.provide('ns.one.two.thee.four');`,
			`goog.require('ns.one.two.thee.five');`
		)
	}, {
		code: concat(
			`// comment before goog section`,
			`goog.provide('ns.one.two.thee.four');`
		)
	}, {
		code: concat(
			`/**`,
			` Multiline comment before goog section`,
			` */`,
			`goog.provide('ns.one.two.thee.four');`
		)
	}, {
		code: concat(
			``, // Empty string before goog section
			`goog.provide('ns.one.two.thee.four');`
		)
	}],
	invalid: [{ // At top of file
		code: concat(
			`someCode();`,
			`goog.provide('ns.one.two.thee.four');`
		),
		errors: errors(
			`Goog section should be at beginning of file.`
		),
		output: concat(
			`goog.provide('ns.one.two.thee.four');`,
			`someCode();`,
			`goog.provide('ns.one.two.thee.four');`
		)
	}, { // Provide after require
		code: concat(
			`goog.require('ns.one.two.thee.five');`,
			`goog.provide('ns.one.two.thee.four');`
		),
		errors: errors(
			`goog.provide("ns.one.two.thee.four") should be before goog.require.`
		),
		output: concat(
			`goog.provide('ns.one.two.thee.four');`,
			`goog.require('ns.one.two.thee.five');`,
			`goog.require('ns.one.two.thee.five');`,
			`goog.provide('ns.one.two.thee.four');`
		)
	}, { // Unsorted require
		code: concat(
			`goog.provide('ns.one.two.thee.four');`,
			`goog.require('ns.one.two.thee.six');`,
			`goog.require('ns.one.two.thee.five');`
		),
		errors: errors(
			`Goog expressions should be alphabetized. "ns.one.two.thee.five" should be before "ns.one.two.thee.six".`
		),
		output: [
			`goog.provide('ns.one.two.thee.four');`,
			`goog.require('ns.one.two.thee.five');`,
			`goog.require('ns.one.two.thee.six');`,
			`goog.provide('ns.one.two.thee.four');`,
			`goog.require('ns.one.two.thee.six');`,
			`goog.require('ns.one.two.thee.five');`
		].join('\n')
	}, { // Unsorted provide
		code: concat(
			`goog.provide('ns.one.two.thee.six');`,
			`goog.provide('ns.one.two.thee.four');`,
			`goog.require('ns.one.two.thee.five');`
		),
		errors: errors(
			`Goog expressions should be alphabetized. "ns.one.two.thee.four" should be before "ns.one.two.thee.six".`
		),
		output: concat(
			`goog.provide('ns.one.two.thee.four');`,
			`goog.provide('ns.one.two.thee.six');`,
			`goog.require('ns.one.two.thee.five');`,
			`goog.provide('ns.one.two.thee.six');`,
			`goog.provide('ns.one.two.thee.four');`,
			`goog.require('ns.one.two.thee.five');`
		)
	}, { // Ungrouped
		code: concat(
			`goog.provide('ns.one.two.thee.four');`,
			`goog.provide('ns.one.two.thee.six');`,
			`someCode();`,
			`goog.require('ns.one.two.thee.five');`
		),
		errors: errors(
			`"ns.one.two.thee.five" should be right after "ns.one.two.thee.six".`
		),
		output: concat(
			`goog.provide('ns.one.two.thee.four');`,
			`goog.provide('ns.one.two.thee.six');`,
			`goog.require('ns.one.two.thee.five');`,
			`goog.provide('ns.one.two.thee.four');`,
			`goog.provide('ns.one.two.thee.six');`,
			`someCode();`,
			`goog.require('ns.one.two.thee.five');`
		)
	}, { // Deep
		code: concat(
			`if (false) {`,
			`   goog.provide('ns.one.two.thee.four');`,
			`}`
		),
		errors: errors(
			`"ns.one.two.thee.four" should be at first level.`
		),
		output: concat(
			`goog.provide('ns.one.two.thee.four');`,
			`if (false) {`,
			`   goog.provide('ns.one.two.thee.four');`,
			`}`
		)
	}]
};
