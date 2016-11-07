/* tslint:disable */
process.env.NODE_ENV = 'test';

declare function require(name: string);
require('source-map-support').install();

import '../index.test';
