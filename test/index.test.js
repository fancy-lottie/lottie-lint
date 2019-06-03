'use strict';

const assert = require('assert');

const linter = require('../src/index');

describe('linter', function() {
  it('matte 遮罩层检测', () => {
    const matteJSON = require('./case_data/matte.json');
    const reports = linter(matteJSON).reports;

    assert.deepStrictEqual(reports, [{
      message: '兼容性警告⚠️: 当前图层存在遮罩层，建议使用蒙版替代',
      name: '发射条.png',
      path: '#/assets[7]/layers[2]',
      rule: 'incompatible_matte_not_suggested',
    }]);
  });

  it('Layer Effects 检测', () => {
    const matteJSON = require('./case_data/layerEffects.json');
    const reports = linter(matteJSON).reports;

    assert.deepStrictEqual(reports, [{
      message: '兼容性警告⚠️: 当前图层存在 Layer Effects，在 iOS 和 Android 上不支持',
      rule: 'incompatible_layer_effects',
      name: 'shadow',
      path: '#/layers[11]',
    }]);
  });
});
