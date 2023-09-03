#!/usr/bin/env node
import commandLineArgs from 'command-line-args';
import { prepareCodeContext } from './index.js';

(async () => {
  const optionDefinitions = [
    { name: 'clearHistory', alias: 'c', type: Boolean },
    { name: 'json', alias: 'j', type: Boolean },
    { name: 'directory', type: String, defaultOption: true },
    { name: 'contents', type: Boolean, defaultOption: false },
  ];

  const options = commandLineArgs(optionDefinitions);

  await prepareCodeContext(
    options.directory || process.cwd(),
    {
      clearHistory: options.clearHistory,
      returnJson: options.json,
      returnContents: options.contents,
    });
})();
