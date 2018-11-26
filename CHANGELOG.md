# Change Log

All notable changes to this project will be documented in this file.

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
