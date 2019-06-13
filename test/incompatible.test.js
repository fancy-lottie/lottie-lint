'use strict';
const assert = require('assert');

const linter = require('../src/index');

describe('version linter', function() {
  it('未导出兼容版本', () => {
    const lottieData = require('./case_data/wftnew.json');
    const reports = linter(lottieData).reports;
    assert.deepStrictEqual(reports, [
      {
        message: '使用了bodymovin 5.5.* 的版本导出 lottie json 文件, 但是没有勾选 Export old JSON format, 导致老版本(5.5.0以下)播放器无法播放',
        rule: 'incompatible_old_json_format',
        element: { asset: -1 },
        type: 'incompatible',
        incompatible: [ 'iOS', 'Web', 'Android' ],
      },
    ]);
  });
  it('导出兼容版本', () => {
    const lottieData = require('./case_data/compatibility.json');
    const reports = linter(lottieData).reports;
    assert.deepStrictEqual(reports, []);
  });
  it('旧版本 小于 5.5.0', () => {
    const matteJSON = require('./case_data/matte.json');
    const reports = linter(matteJSON).reports;

    assert.deepStrictEqual(reports, [
      {
        message: '“形状” 如果可以转化成 “图片” 运行，性能可以更好',
        type: 'info',
        rule: 'info_layertype_shape',
        name: '形状图层 1',
        element: {
          asset: 7,
          layer: 1,
        },
      },
      {
        message: '图层存在 “遮罩层” 特性，极其损耗性能，建议不使用，或用 “蒙版” 替代',
        type: 'warn',
        rule: 'warn_matte_not_suggested',
        name: '发射条.png',
        element: {
          asset: 7,
          layer: 2,
        },
      },
    ]);
  });
});
