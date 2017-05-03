import path from 'path';
import fs from 'fs';

import { readFile, writeFile, copyFile, readDir, makeDir, copyDir, cleanDir } from '../tools/lib/fs';

import startSeq from './sequelize';
import startNedb from './nedb';
//import startPhantom from './phantom';
import startWallet from './wallet';

// -----------------------------------------------------------------------------------------

const uuidV4 = require('uuid/v4');

const debug = require('debug')('index');

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// print log for promise that unhandle rejection
process.on('unhandledRejection', (e) => {
  debug('%s %0', e.message, e.stack);
});

// -----------------------------------------------------------------------------------------

// clean output
const clean = () => {
  return Promise.all([
    cleanDir('data/output/*', {
      nosort: true,
      dot: true
    }),
    cleanDir('models/*', {
      nosort: true,
      dot: true
    }),
  ]);
}

// -----------------------------------------------------------------------------------------

const inputRoot = 'data/input';
const outputRoot = 'data/output';
const filenameSeparator = '___';

const getFileName = (filepath) => {
  const arr = filepath.split('/');
  const filename = arr.join(filenameSeparator);
  //console.log('filename: ', filename);
  return filename;
}

// -----------------------------------------------------------------------------------------

const startRead = async (filepath) => {
  //console.log('start read => filepath: ', filepath);
  const ext = '.json';
  const filename = `${getFileName(filepath)}`;
  const input = `${inputRoot}/${filepath}`;

  const nedbOutput = `${outputRoot}/${filename}_NEDB_${ext}`;
  const seqOutput = `${outputRoot}/${filename}_SEQUELIZE_${ext}`;
  const walOutput = `${outputRoot}/${filename}_WALLET_${ext}`;

  await startSeq(input, seqOutput); // not much reliability
  //await startNedb(input, nedbOutput); // sometime cannot fully get enough data
  await startWallet(seqOutput, walOutput);
}

// -----------------------------------------------------------------------------------------

const startConvert = async (filepath) => {
  await clean();
  console.log('==============================> cleanup done');

  const files = await readDir('**/*.sqlite3', {
    nosort: false,
  });
  //console.log('all files: ', files);
  const matches = files.map(function (match) {
    return path.relative(inputRoot, match);
  });
  //console.log('all file matches: ', matches);
  matches.map(async (filepath) => {
    await startRead(filepath);
  });

}

// -----------------------------------------------------------------------------------------

startConvert();

// -----------------------------------------------------------------------------------------
