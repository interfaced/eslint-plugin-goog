const {isGoogExpression, extractNamespaceFromMemberExpression, extractNamespacesFromComment} = require('../utils');

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
				excludedPatterns: {
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
		const domains = Array.from(new Set([
			...(context.options[0] || {})['domains'] || [],
			...(context.settings || {})['domains'] || []
		]));

		const knownNamespaces = Array
			.from(new Set([
				...(context.options[0] || {})['knownNamespaces'] || [],
				...(context.settings || {})['knownNamespaces'] || []
			]))
			.sort()
			.reverse();

		const excludedPatterns = (context.options[0] || {})['excludedPatterns'] || [];

		const usedNamespaceNodes = [];
		const reportedNamespaces = [];
		const declaredNamespaces = [];
		const namespacesToFix = [];

		function isExcludedPattern(value) {
			return excludedPatterns.some((pattern) => {
				const isExcludedString = value.includes(pattern);

				if (!isExcludedString) {
					try {
						const excludedRegExp = new RegExp(pattern);

						return excludedRegExp.test(value);
					} catch (e) {
						return false;
					}
				}

				return true;
			});
		}

		function reportUndeclaredNamespace(node, namespace) {
			const fixNamespace = knownNamespaces.filter((ns) => namespace.startsWith(ns))[0];
			const isDeclared = declaredNamespaces.some((declared) =>
				fixNamespace ? declared === fixNamespace : namespace.startsWith(declared)
			);
			const isReported = reportedNamespaces.indexOf(fixNamespace) !== -1 ||
				reportedNamespaces.indexOf(namespace) !== -1;

			if (!isDeclared && !isReported && !isExcludedPattern(namespace)) {
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
						extractNamespacesFromComment(commentNode)
							.forEach((namespace) => {
								if (namespace.startsWith(domain)) {
									reportUndeclaredNamespace(commentNode, namespace);
								}
							});
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
						node,
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
