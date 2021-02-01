# Change Log

All notable changes to this project will be documented in this file.

<a name="3.7.6"></a>
# [3.7.6](https://github.com/creditkarma/thrift-typescript/compare/v3.7.5...v3.7.6) (2019-09-03)

### Bug Fixes

* Update resolve type ([49d749](https://github.com/creditkarma/thrift-typescript/commit/49d749))
* Revert "fix: update how type for temp object in encode is defined to fix strict unions" ([a38c72](https://github.com/creditkarma/thrift-typescript/commit/a38c72))

<a name="3.7.5"></a>
# [3.7.5](https://github.com/creditkarma/thrift-typescript/compare/v3.7.4...v3.7.5) (2019-08-15)

### Bug Fixes

* Update exports ([322343](https://github.com/creditkarma/thrift-typescript/commit/322343))

<a name="3.7.4"></a>
# [3.7.4](https://github.com/creditkarma/thrift-typescript/compare/v3.7.2...v3.7.4) (2019-08-12)

### Bug Fixes

* Update how type for temp object in encode is defined to fix strict unions ([971cb1](https://github.com/creditkarma/thrift-typescript/commit/971cb1))
* Hack to fix maps with strict unions ([c24475](https://github.com/creditkarma/thrift-typescript/commit/c24475))

<a name="3.7.2"></a>
# [3.7.2](https://github.com/creditkarma/thrift-typescript/compare/v3.7.1...v3.7.2) (2019-07-19)

### Features

* Add explicit type to temporary object when encoding structs and unions ([9d30b3](https://github.com/creditkarma/thrift-typescript/commit/9d30b3))
* Disable eslint for generated files ([9de3b6](https://github.com/creditkarma/thrift-typescript/commit/9de3b6))

<a name="3.7.1"></a>
# [3.7.1](https://github.com/creditkarma/thrift-typescript/compare/v3.6.2...v3.7.1) (2019-06-17)

### Bug Fixes

* Refactoring ([80ef07](https://github.com/creditkarma/thrift-typescript/commit/80ef07))
* Default values for unions should only be used when no fields are set ([9f2a78](https://github.com/creditkarma/thrift-typescript/commit/9f2a78))

<a name="3.6.2"></a>
# [3.6.2](https://github.com/creditkarma/thrift-typescript/compare/v3.6.0...v3.6.2) (2019-05-24)

### Features

* Include method parameters map ([1f74c7](https://github.com/creditkarma/thrift-typescript/commit/1f74c7))

### Bug Fixes

* MethodParams should be optional ([9f3921](https://github.com/creditkarma/thrift-typescript/commit/9f3921))

<a name="3.6.0"></a>
# [3.6.0](https://github.com/creditkarma/thrift-typescript/compare/v3.5.0...v3.6.0) (2019-04-26)

### Features

* Replace import equals declarations with const and type alias statement ([4f39da](https://github.com/creditkarma/thrift-typescript/commit/4f39da))

### Bug Fixes

* Add root namespace construct to fix invalid imports of root namespace into other namespace files ([011a35](https://github.com/creditkarma/thrift-typescript/commit/011a35))

<a name="3.5.0"></a>
# [3.5.0](https://github.com/creditkarma/thrift-typescript/compare/v3.4.2...v3.5.0) (2019-04-16)

### Features

* Export resolve/validator APIs ([7d719f](https://github.com/creditkarma/thrift-typescript/commit/7d719f))
* Add option to render all struct-like objects with a name field ([d1b31f](https://github.com/creditkarma/thrift-typescript/commit/d1b31f))

<a name="3.4.2"></a>
# [3.4.2](https://github.com/creditkarma/thrift-typescript/compare/v3.4.0...v3.4.2) (2019-04-11)

### Bug Fixes

* Resolve issue with service inheritance within namespace ([798a70](https://github.com/creditkarma/thrift-typescript/commit/798a70))

<a name="3.4.0"></a>
# [3.4.0](https://github.com/creditkarma/thrift-typescript/compare/v3.3.2...v3.4.0) (2019-04-10)

### Features

* Refactor: Split files by type ([c15a83](https://github.com/creditkarma/thrift-typescript/commit/c15a83))

<a name="3.3.2"></a>
# [3.3.2](https://github.com/creditkarma/thrift-typescript/compare/v3.3.1...v3.3.2) (2019-03-14)

### Bug Fixes

* Add option to mangle generated type enum ([46d7a1](https://github.com/creditkarma/thrift-typescript/commit/46d7a1))

<a name="3.3.1"></a>
# [3.3.1](https://github.com/creditkarma/thrift-typescript/compare/v3.3.0...v3.3.1) (2019-03-13)

### Bug Fixes

* Properly handle loose i64 types during encoding ([9b738e](https://github.com/creditkarma/thrift-typescript/commit/9b738e))

<a name="3.3.0"></a>
# [3.3.0](https://github.com/creditkarma/thrift-typescript/compare/v3.2.2...v3.3.0) (2019-03-12)

### Features

* Allow i64 to be represented as string in user code ([0831ec](https://github.com/creditkarma/thrift-typescript/commit/0831ec))

### Bug Fixes

* Fixes an issue where defined constants could not be used as values in Thrift IDL ([205716](https://github.com/creditkarma/thrift-typescript/commit/205716))

<a name="3.2.2"></a>
# [3.2.2](https://github.com/creditkarma/thrift-typescript/compare/v3.1.1...v3.2.2) (2019-03-05)

### Features

* Add support for strict unions ([30c5d3](https://github.com/creditkarma/thrift-typescript/commit/30c5d3))
* Allow service method returns types as defined by `IHandler` to be loose types ([44e474](https://github.com/creditkarma/thrift-typescript/commit/44e474))

<a name="3.0.2"></a>
# [3.0.2](https://github.com/creditkarma/thrift-typescript/compare/v3.0.1...v3.0.2) (2018-11-26)

### Bug Fixes

* Fix an issue where annotations that weren't valid JavaScript identifiers produced invalid TypeScript ([c504b4](https://github.com/creditkarma/thrift-typescript/commit/c504b4))
* Fix an issue where i64 types could not be used as keys in maps ([5e1581](https://github.com/creditkarma/thrift-typescript/commit/5e1581))

<a name="3.0.0"></a>
# [3.0.0](https://github.com/creditkarma/thrift-typescript/compare/v2.0.8...v3.0.0) (2018-10-11)

### Notes

* There are no meaningful changes to code generated for [Apache](https://github.com/apache/thrift/tree/master/lib/nodejs).

### Features

* Expose annotations for structs and services in the generated code ([32d3a9](https://github.com/creditkarma/thrift-typescript/commit/32d3a9966e1122db5c8068d8f3b9cec440ae04a9))

### BREAKING CHANGES

* Starting with 3.0.0 the generated code for [Thrift Server](https://github.com/creditkarma/thrift-server) relies on types only defined in the [0.9.0](https://github.com/creditkarma/thrift-server/tree/v0.9.0) release of that library.
