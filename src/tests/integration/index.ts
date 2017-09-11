import { fork } from 'child_process'
import { compile } from '../../app/'

process.chdir(__dirname)

compile({
  rootDir: '.',
  outDir: 'thrift',
  files: [ 'test.thrift' ]
});

fork('./client.ts')
fork('./server.ts')