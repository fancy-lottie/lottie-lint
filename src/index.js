'use strict';

const LottieLint = require('./LottieLint');

module.exports = function(jsonData) {
  const lottieLint = new LottieLint(jsonData);
  return lottieLint.getResult();
};

