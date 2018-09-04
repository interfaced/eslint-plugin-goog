function extractNamespaceFromMemberExpression(node) {
	const namespaceChunks = [];

	namespaceChunks.push(node.object.name);
	namespaceChunks.push(node.property.name);

	let memberExpressionParent = node.parent;
	while (memberExpressionParent) {
		if (memberExpressionParent.type === 'MemberExpression' &&
			memberExpressionParent.property.type === 'Identifier'
		) {
			namespaceChunks.push(memberExpressionParent.property.name);
		} else {
			break;
		}

		memberExpressionParent = memberExpressionParent.parent;
	}

	return namespaceChunks.join('.');
}

function isGoogExpression(expression) {
	return (
		expression.callee.object &&
		expression.callee.object.name === 'goog' &&
		['require', 'provide'].indexOf(expression.callee.property.name) !== -1
	);
}

function isGoogProvideExpression(expression) {
	return isGoogExpression(expression) && expression.callee.property.name === 'provide';
}

function isGoogRequireExpression(expression) {
	return isGoogExpression(expression) && expression.callee.property.name === 'require';
}

function getNamespaceFromGoogExpression(node) {
	return node.arguments[0].value;
}

module.exports = {
	extractNamespaceFromMemberExpression,
	isGoogExpression,
	isGoogProvideExpression,
	isGoogRequireExpression,
	getNamespaceFromGoogExpression
};
