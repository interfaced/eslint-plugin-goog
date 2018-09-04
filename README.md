# ESLint plugin "goog"

***

Rules for "goog" library

## Usage

1) Install the package

```
npm i eslint-plugin-goog --save-dev
```

2) Specify "goog" as plugin in your .eslintrc

```
{
  "plugins": [
    "goog"
  ]
}
```

3) Enable all of the rules that you would like to use in your .eslintrc

```
{
  "rules": [
    "goog/no-undeclared-deps": ...
  ]
}
```

## Rules

### no-undeclared-deps (fixable)

Use this rule to detect usage of undeclared dependencies (missed `goog.require(<namespace>)` expression)

#### Options

```
"no-undeclared-deps": [<enabled>, {
  domains: string[], // List of root namespaces that rule will use for report as undeclared
  knownNamespaces: string[] // List of provided namespaces that rule will be able to fix
}]
```

**Caveat**: rule fixes only namespaces that are given by options `knownNamespaces`. Plugin provides module `nsUtils` to ease retrieving of known namespaces, e.x.:

```
// Your .eslintrc.js

const eslintPluginGoog = require("eslint-plugin-goog");

const knownNamespaces = [
  ...eslintPluginGoog.nsUtils.findByPattern(path.join(__dirname , "myapp", "**", "*.js")),
  ...eslintPluginGoog.nsUtils.findByPattern(path.join(__dirname , "node_modules", "zombiebox", "**", "*.js")),
];

module.exports = {
  // ...
  "rules": [
    "goog/no-undeclared-deps": ["error", {domains: ["myapp"], knownNamespaces}]
  ]
}
```

### no-unused-deps (fixable)

Use this rule to detect when declared dependencies (`goog.require(<namespace>)` expression) are unused in code

#### Options

```
"no-unused-deps": [<enabled>, {
  domains: string[] // List of root namespaces that rule will use for report as undeclared
}]
```

### no-duplicates (fixable)

Use this rule to prevent duplicates in `goog.require` or `goog.provide` expressions

#### Options

```
"no-duplicates": [<enabled>]
```

### right-order (fixable)

Use this rule to achieve right order of `goog` expressions. This rule does:

* Checks that `goog` expressions are sorted alphabetically by its namespace
* Checks that `goog` expressions are at top of a file
* Checks that `goog.provide` goes before `goog.require`
* Checks that there are no additional code or comments between `goog` expressions
* Restricts nested `goog` expressions (parent AST node should have `Program` type)

#### Options

```
"right-order": [<enabled>]
```
