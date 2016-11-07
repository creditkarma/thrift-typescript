# thrift-typescript

Generate TypeScript from Thrift IDL files.

## Installation

```sh
npm install --save @creditkarma/thrift-typescript
```

## Usage

Given the following files

thrift/simple.thrift

```
struct MyStruct {
    1: required int id,
    2: required bool field1,
    # 3: required string field,
    4: required i16 field,
}
```

Parse and load AST:

```js
const generator = require('@creditkarma/thrift-typescript')

loader.parseFile('./thrift/simple.thrift').then((ast) => {
  console.log(ast)
})
```

## Development

Install dependencies with

```sh
npm install
```

### Build

```sh
npm run build
```


### Run test in watch mode

```sh
npm run test:watch
```

## Contributing
For more information about contributing new features and bug fixes, see our [Contribution Guidelines](https://github.com/creditkarma/CONTRIBUTING.md).
External contributors must sign Contributor License Agreement (CLA)

## License
This project is licensed under [Apache License Version 2.0](./LICENSE)
