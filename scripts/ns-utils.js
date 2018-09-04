const glob = require('glob');
const fs = require('fs');

/**
 * @param {string} filePath
 * @return {Array<string>}
 */
function namespacesFromFile(filePath) {
	const source = fs.readFileSync(filePath, 'utf-8');
	const exp = /^goog\.provide\s*\(\s*['"]([^)]+)['"]\s*\)/gm;
	const ns = [];

	let match;
	// eslint-disable-next-line no-cond-assign
	while (match = exp.exec(source)) {
		if (match[1] === 'zb') {
			continue;
		}

		ns.push(match[1]);
	}

	return ns;
}

/**
 * @param {string} globPattern E.g. __dirname + '/app/*.js'
 * @return {Array<string>}
 */
function findByPattern(globPattern) {
	return Array.prototype.concat.apply([], glob.sync(globPattern).map(namespacesFromFile));
}

module.exports = {
	findByPattern: findByPattern,
	namespacesFromFile: namespacesFromFile
};
