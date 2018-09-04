# Change log

## 0.4.0 (release date: 11.12.2017)

* Consider shared settings for `domains` and `knownNamespaces` specifying

## 0.3.2 (release date: 23.11.2017)

* `right-order`: don't report about unexpected comment for some reserved words

## 0.3.1 (release date: 20.11.2017)

* Required `npm@5`
* `no-undeclared-deps`: added `excludedPatterns` option

## 0.3.0 (release date: 31.10.2017)

* Migrate to ESLint 4
* More strict JSDoc parsing in `no-undeclared-deps` and `no-unused-deps`

## 0.2.0 (release date: 29.03.2017)

* Added rule `right-order`
* Added rule `no-duplicates`
* Made rule `no-undeclared-deps` fixable

## 0.1.2 (release date: 30.12.2016)

* Fixed namespace extracting from JSDoc by improving of the parsing regular expression
* Fixed namespace extracting from member expression to prevent unwanted `.` character in the end of the extracted namespace

## 0.1.1 (release date: 27.12.2016)

* Made rule `no-unused-deps` fixable
* Fixed regex that finds namespace in the comment string to include `<` symbol after namespace

## 0.1.0 (release date: 23.12.2016)

* Initial release
