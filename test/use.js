'use strict';

const linter = require('..');
const matte = require('./matte.json');

const reports = linter(matte).reports;

console.log(reports);
