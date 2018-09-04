const doctrine = require('doctrine');

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

function extractJSDocTypeNames(type, names = []) {
	switch (type.type) {
		case 'NullableType':
		case 'NonNullableType':
		case 'OptionalType':
		case 'RestType':
			extractJSDocTypeNames(type.expression, names);

			break;

		case 'TypeApplication':
			type.applications.forEach((application) =>
				extractJSDocTypeNames(application, names)
			);

			extractJSDocTypeNames(type.expression, names);

			break;

		case 'FunctionType':
			type.params.forEach((param, index) => {
				extractJSDocTypeNames(param, names);
			});

			if (type.result) {
				extractJSDocTypeNames(type.result, names);
			}

			if (type.this) {
				extractJSDocTypeNames(type.this, names);
			}

			break;

		case 'RecordType':
			type.fields.forEach((field) =>
				extractJSDocTypeNames(field.value, names)
			);

			break;

		case 'UnionType':
			type.elements.forEach((element) =>
				extractJSDocTypeNames(element, names)
			);

			break;

		case 'NameExpression':
			const name = type.name;

			if (names.indexOf(name) === -1) {
				names.push(name);
			}
	}

	return names;
}

function extractNamespacesFromComment(commentNode) {
	if (commentNode.type !== 'Block') {
		return [];
	}

	let JSDoc = null;
	try {
		JSDoc = doctrine.parse(commentNode.value, {
			strict: true,
			unwrap: true,
			sloppy: true
		});
	} catch (e) {
		// Can't parse JSDoc
		if (e instanceof doctrine.Error) {
			return [];
		}

		throw e;
	}

	return Array.from(new Set(
		JSDoc.tags.reduce((acc, tag) => acc.concat(tag.type ? extractJSDocTypeNames(tag.type) : []), [])
	));
}

module.exports = {
	extractNamespaceFromMemberExpression,
	isGoogExpression,
	isGoogProvideExpression,
	isGoogRequireExpression,
	getNamespaceFromGoogExpression,
	extractNamespacesFromComment
};
