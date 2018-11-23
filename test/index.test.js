'use strict';

const assert = require('assert');

const linter = require('..');

describe('linter', function() {
  it('matte 遮罩层检测', () => {
    const matteJSON = require('./case_data/matte.json');
    const reports = linter(matteJSON).reports;

    assert.deepStrictEqual(reports, [{
      message: '当前图层存在遮罩层，建议使用蒙版替代',
      name: '发射条.png',
      path: '#/assets[7]/layers[2]',
      rule: 'matte_not_suggested',
    }]);
  });
});
