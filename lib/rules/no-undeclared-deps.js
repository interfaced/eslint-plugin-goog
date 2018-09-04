const extractNamespaceFromMemberExpression = require('../utils').extractNamespaceFromMemberExpression;
const isGoogExpression = require('../utils').isGoogExpression;

module.exports = {
	meta: {
		schema: [{
			type: 'object',
			properties: {
				domains: {
					type: 'array',
					items: {
						type: 'string'
					}
				},
				knownNamespaces: {
					type: 'array',
					items: {
						type: 'string'
					}
				}
			},
			additionalProperties: true
		}],
		fixable: 'code'
	},
	create: (context) => {
		const options = (context.options[0] || {});
		const domains = options['domains'] || [];
		const knownNamespaces = (options['knownNamespaces'] || []).slice()
			.sort()
			.reverse();

		const usedNamespaceNodes = [];
		const reportedNamespaces = [];
		const declaredNamespaces = [];
		const namespacesToFix = [];

		function reportUndeclaredNamespace(node, namespace) {
			const fixNamespace = knownNamespaces.filter((ns) => namespace.startsWith(ns))[0];
			const isDeclared = declaredNamespaces.some((declared) =>
				fixNamespace ? declared === fixNamespace : namespace.startsWith(declared)
			);
			const isReported = reportedNamespaces.indexOf(fixNamespace) !== -1 ||
				reportedNamespaces.indexOf(namespace) !== -1;

			if (!isDeclared && !isReported) {
				if (fixNamespace) {
					reportedNamespaces.push(fixNamespace);
					namespacesToFix.push(fixNamespace);
				}

				context.report(node, `Dependency "${fixNamespace || namespace}" is used but undeclared.`);
				reportedNamespaces.push(namespace);
			}
		}

		return {
			MemberExpression: (node) => {
				if (domains.indexOf(node.object.name) !== -1) {
					usedNamespaceNodes.push(node);
				}
			},
			'Program:exit': (node) => {
				let lastGoogExpression = null;

				node.body
					.filter((subNode) => ((
						subNode.type === 'ExpressionStatement' &&
						subNode.expression.type === 'CallExpression'
					)))
					.forEach((subNode) => {
						const expression = subNode.expression;

						if (isGoogExpression(expression)) {
							declaredNamespaces.push(expression.arguments[0].value);

							lastGoogExpression = expression;
						}
					});

				node.comments.forEach((commentNode) => {
					if (commentNode.type !== 'Block') {
						return;
					}

					domains.forEach((domain) => {
						const domainRegex = new RegExp(domain + '\\..*?(?!(?:\\w|\\.\\w))');

						if (domainRegex.test(commentNode.value)) {
							reportUndeclaredNamespace(
								commentNode,
								domainRegex.exec(commentNode.value)[0]
							);
						}
					});
				});

				usedNamespaceNodes.forEach((usedNamespaceNode) => {
					reportUndeclaredNamespace(
						usedNamespaceNode,
						extractNamespaceFromMemberExpression(usedNamespaceNode)
					);
				});

				if (namespacesToFix.length) {
					context.report({
						node: node,
						loc: {
							start: {line: 1, column: 0},
							end: {line: 1, column: 0}
						},
						message: `Undeclared dependencies: ${namespacesToFix.map((ns) => `"${ns}"`).join(', ')}.`,
						fix: (fixer) => {
							const code = namespacesToFix.map((s) => `goog.require('${s}');`).join('\n');

							if (lastGoogExpression) {
								return fixer.insertTextAfter(lastGoogExpression, ';\n' + code);
							}

							return fixer.insertTextBeforeRange([0, 0], code + '\n');
						}
					});
				}
			}
		};
	}
};
