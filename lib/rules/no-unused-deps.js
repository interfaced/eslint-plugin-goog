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

		const sourceCode = context.getSourceCode();
		const usedNamespaceDeclarationNodes = [];
		const usedNamespaces = [];

		function reportUnusedNamespaceDeclaration(node) {
			const declaredNamespace = node.arguments[0].value;
			if (domains.indexOf(declaredNamespace.split('.')[0]) === -1) {
				return;
			}

			const usedInCode = usedNamespaces.some((usedNamespace) => ((
				usedNamespace === declaredNamespace ||
				usedNamespace.indexOf(declaredNamespace) !== -1
			)));

			const usedInComments = sourceCode.getAllComments()
				.some((commentNode) => ((
					commentNode.type === 'Block' &&
					extractNamespacesFromComment(commentNode)
						.some((namespace) => namespace.indexOf(declaredNamespace) !== -1)
				)));

			if (!usedInCode && !usedInComments) {
				context.report({
					node,
					message: `Dependency "${declaredNamespace}" is declared but never used.`,
					fix: (fixer) => {
						const beforeToken = sourceCode.getTokenBefore(node, {
							includeComments: true
						});

						return fixer.removeRange([beforeToken ? beforeToken.range[1] : 0, node.range[1]]);
					}
				});
			}
		}

		return {
			CallExpression: (node) => {
				if (isGoogExpression(node)) {
					usedNamespaceDeclarationNodes.push(node);
				}
			},
			MemberExpression: (node) => {
				if (domains.indexOf(node.object.name) !== -1) {
					usedNamespaces.push(extractNamespaceFromMemberExpression(node));
				}
			},
			'Program:exit': () => {
				usedNamespaceDeclarationNodes.forEach((usedDeclarationNode) => {
					reportUnusedNamespaceDeclaration(usedDeclarationNode);
				});
			}
		};
	}
};
