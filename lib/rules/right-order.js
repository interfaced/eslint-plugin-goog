const {
	isGoogExpression,
	isGoogRequireExpression,
	isGoogProvideExpression,
	getNamespaceFromGoogExpression
} = require('../utils');

module.exports = {
	meta: {
		fixable: 'code'
	},
	create: (context) => {
		const sourceCode = context.getSourceCode();
		const googNodes = [];

		function getPreviousGoogNode(node, filter) {
			let prev = null;
			for (const iterNode of googNodes) {
				if (iterNode === node) {
					break;
				}
				if (filter && !filter(iterNode)) {
					continue;
				}
				prev = iterNode;
			}

			return prev;
		}

		const getGoogName = getNamespaceFromGoogExpression;

		function reportDeepGoogNode(node) {
			if (node.parent.parent.type !== 'Program') {
				context.report(node, `"${getGoogName(node)}" should be at first level.`);

				return true;
			}

			return false;
		}

		function reportUngroupedGoogNode(node) {
			let reported = false;

			const prevExpression = getPreviousGoogNode(node);
			if (prevExpression) {
				const tokensBetween = sourceCode.getTokensBetween(prevExpression.parent, node.parent);
				if (tokensBetween.length) {
					context.report(
						node,
						`"${getGoogName(node)}" should be right after "${getGoogName(prevExpression)}".`
					);
					reported = true;
				}

				const comments = sourceCode.getCommentsBefore(node.parent);
				if (comments.length) {
					context.report(node, `"${getGoogName(node)}" should not have a comments.`);
					reported = true;
				}
			}

			return reported;
		}

		function reportUnsortedGoogNode(node) {
			const filter = isGoogProvideExpression(node) ? isGoogProvideExpression : isGoogRequireExpression;

			const prevExpression = getPreviousGoogNode(node, filter);
			if (prevExpression) {
				const current = getGoogName(node);
				const prev = getGoogName(prevExpression);
				if (current < prev) {
					context.report(
						node,
						`Goog expressions should be alphabetized. "${current}" should be before "${prev}".`
					);

					return true;
				}
			}

			return false;
		}

		function reportProvideAfterRequire(node, index) {
			if (isGoogProvideExpression(node)) {
				for (let i = 0; i < index; i++) {
					if (isGoogRequireExpression(googNodes[i])) {
						context.report(node, `goog.provide("${getGoogName(node)}") should be before goog.require.`);

						return true;
					}
				}
			}

			return false;
		}

		function reportNodesBeforeFirstGoog(firstGoogNode) {
			if (sourceCode.getTokenBefore(firstGoogNode.parent)) {
				context.report(firstGoogNode, `Goog section should be at beginning of file.`);

				return true;
			}

			return false;
		}

		return {
			CallExpression: (node) => {
				if (isGoogExpression(node)) {
					googNodes.push(node);
				}
			},
			'Program:exit': (program) => {
				const namespaces = googNodes.map(getGoogName);

				// Ignore duplicates for prevent recursion fixing
				for (let i = namespaces.length; i--;) {
					for (let j = i; j--;) {
						if (namespaces[i] === namespaces[j]) {
							googNodes.splice(i, 1);
							break;
						}
					}
				}

				const hasErrors = googNodes
					.map((node, index) =>
						reportDeepGoogNode(node) ||
						reportUngroupedGoogNode(node) ||
						reportUnsortedGoogNode(node) ||
						reportProvideAfterRequire(node, index) ||
						(index === 0 && reportNodesBeforeFirstGoog(node))
					)
					.some((v) => v);

				if (hasErrors) {
					context.report({
						node: program,
						log: {
							start: {line: 1, column: 0},
							end: {line: 1, column: 0}
						},
						message: 'There are some expressions order problems.',
						fix: (fixer) => {
							const firstGoog = googNodes[0];
							const code = googNodes.slice(0)
								.map((node) => {
									const type = isGoogProvideExpression(node) ? 'provide' : 'require';

									return `goog.${type}('${getGoogName(node)}');`;
								})
								.sort()
								.join('\n') + '\n';

							if (sourceCode.getTokenBefore(firstGoog.parent)) {
								return fixer.insertTextBeforeRange([0, 0], code);
							}

							return fixer.insertTextBefore(firstGoog, code);
						}
					});
				}
			}
		};
	}
};
