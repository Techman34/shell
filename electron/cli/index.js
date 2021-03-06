// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

// eslint-disable-next-line
const dynamicRequire = typeof __non_webpack_require__ === 'undefined' ? require : __non_webpack_require__; // Dynamic require https://github.com/yargs/yargs/issues/781

const { app } = require('electron');
const fs = require('fs');
const omit = require('lodash/omit');
const { spawn } = require('child_process');

const argv = dynamicRequire('yargs').argv;
const parityPath = require('../util/parityPath');
const { version } = require('../../package.json');

let parityArgv = null; // Args to pass to `parity` command

/**
 * Show output of `parity` command with args. The args are supposed to make
 * parity stop, so that the output can be immediately shown on the terminal.
 *
 * @param {Array<String>} args - The arguments to pass to `parity`.
 */
const showParityOutput = args => {
  if (fs.existsSync(parityPath())) {
    const parityHelp = spawn(parityPath(), args);

    parityHelp.stdout.on('data', data => console.log(data.toString()));
    parityHelp.on('close', () => app.quit());
  } else {
    console.log('Please run Parity UI once to install Parity Ethereum Client. This help message will then show all available commands.');
    app.quit();
  }

  return false;
};

module.exports = () => {
  if (argv.help || argv.h) {
    return showParityOutput(['--help']);
  }

  if (argv.version || argv.v) {
    console.log(`Parity UI version ${version}.`);
    return showParityOutput(['--version']);
  }

  // Used cached value if it exists
  if (parityArgv) {
    return [argv, parityArgv];
  }

  // Args to pass to `parity` command
  parityArgv = omit(argv, '_', '$0');

  // Delete all keys starting with --ui* from parityArgv.
  // They will be handled directly by the UI.
  Object.keys(parityArgv).forEach(key => key.startsWith('ui') && delete parityArgv[key]);

  return [argv, parityArgv];
};
