module.exports = {
	errors: (...args) => args.map((msg) => ({message: msg})),
	concat: (...args) => args.join('\n')
};
