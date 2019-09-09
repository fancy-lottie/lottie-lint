const assert = require('assert');

import linter from '../src';

describe('version linter', function() {
  it('未导出兼容版本', () => {
    const lottieData = require('./case_data/wftnew.json');
    const reports = linter(lottieData).reports;
    assert.deepStrictEqual(reports, [
      {
        message: '使用插件版本5.5.0+，客户端必须也是5.5.0+，ios/android旧版播放器会闪退',
        rule: 'warn_old_json_format',
        element: { asset: -1 },
        type: 'warn',
        name: '风险',
        incompatible: [ 'iOS', 'Web', 'Android' ],
      },
    ]);
  });
  it('5.5.0+版本判断细化, 连带渐变描边、渐变填充规则', () => {
    const lottieData = require('./case_data/gradient.json');
    const reports = linter(lottieData).reports;
    assert.deepStrictEqual(reports, [
      {
        message: '“形状” 如果可以转化成 “图片” 运行，性能可以更好',
        type: 'info',
        rule: 'info_layertype_shape',
        name: '形状图层 1',
        element: {
          asset: -1,
          layer: 0,
        },
      },
      {
        message: '渐变的绘制存在乱码异常',
        type: 'warn',
        rule: 'warn_gradient_warn',
        name: '渐变填充 1',
        element: {
          asset: -1,
          layer: 0,
          shape: 0,
          groupIt: 1,
        },
      },
      {
        message: '渐变的绘制存在乱码异常',
        type: 'warn',
        rule: 'warn_gradient_warn',
        name: '渐变描边 1',
        element: {
          asset: -1,
          layer: 0,
          shape: 0,
          groupIt: 2,
        },
      },
      {
        message: '形状图层的 Gradient Strokes，在 iOS 上不支持',
        type: 'incompatible',
        incompatible: [
          'iOS',
        ],
        rule: 'incompatible_gradient_strokes',
        name: '渐变描边 1',
        element: {
          asset: -1,
          layer: 0,
          shape: 0,
          groupIt: 2,
        },
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
