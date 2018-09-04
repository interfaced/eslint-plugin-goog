const isGoogExpression = require('../utils').isGoogExpression;
const getNamespaceFromGoogExpression = require('../utils').getNamespaceFromGoogExpression;

module.exports = {
	meta: {
		fixable: 'code'
	},
	create: (context) => {
		const googDeclarations = [];
		const reported = [];

		function reportDuplicate(node, index) {
			const current = getNamespaceFromGoogExpression(node);

			for (let i = 0; i < index; i++) {
				const item = googDeclarations[i];
				if (getNamespaceFromGoogExpression(item) === current && -1 === reported.indexOf(item)) {
					context.report({
						node,
						message: `Duplicate namespace "${current}".`,
						fix: (fixer) => fixer.remove(node)
					});

					reported.push(node);

					break;
				}
			}
		}

		return {
			CallExpression: (node) => {
				if (isGoogExpression(node)) {
					googDeclarations.push(node);
				}
			},
			'Program:exit': () => {
				googDeclarations.forEach(reportDuplicate);
			}
		};
	}
};
