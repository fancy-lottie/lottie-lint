const assert = require('assert');

import linter from '../src/index';

describe('version linter.standard', function() {
  it('未导出兼容版本', () => {
    const lottieData = require('./case_data/wftnew.json');
    const reports = linter.standard(lottieData).reports;
    assert.deepStrictEqual(reports, [
      {
        message: '使用插件版本5.5.0+，客户端必须也是5.5.0+，ios/android旧版播放器会闪退',
        rule: 'warn_old_json_format',
        element: { asset: -1 },
        type: 'incompatible',
        name: '风险',
        incompatible: [ 'iOS', 'Web', 'Android' ],
      },
    ]);
  });
  it('未导出兼容版：超出5.6.9放弃检测, 顺带检测sr', () => {
    const lottieData = require('./case_data/wftnew5.6.9.json');
    const reports = linter.standard(lottieData).reports;
    assert.deepStrictEqual(reports, [{
      element: {
        asset: 3,
        layer: 0,
      },
      incompatible: [
        'iOS',
        'android',
        'web',
      ],
      message: '时间伸缩的拉伸因子不为100%，客户端可能展示异常',
      name: '惠.png 2',
      rule: 'incompatible_sr_not_100',
      type: 'incompatible',
    }]);
  });
  it('5.5.0+版本判断细化, 连带渐变描边、渐变填充规则', () => {
    const lottieData = require('./case_data/gradient.json');
    const reports = linter.standard(lottieData).reports;
    assert.deepStrictEqual(reports, [
      {
        message: '使用插件版本5.5.0+，客户端必须也是5.5.0+，ios/android旧版播放器会闪退',
        rule: 'warn_old_json_format',
        element: { asset: -1 },
        type: 'incompatible',
        name: '风险',
        incompatible: [ 'iOS', 'Web', 'Android' ],
      },
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
        message: '形状图层的渐变描边，在 iOS 上不支持',
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
    const reports = linter.standard(lottieData).reports;
    assert.deepStrictEqual(reports, [
      {
        element: {
          asset: 4,
          layer: 1,
        },
        incompatible: [ 'iOS' ],
        message: '5.6.10以后版本缺省缩放属性导致ios可能无法播放',
        name: 'LINE Copy备份 2.png',
        rule: 'incompatible_keyframes_size_undefined',
        type: 'incompatible',
      },
    ]);
  });
  it('旧版本 小于 5.5.0', () => {
    const matteJSON = require('./case_data/matte.json');
    const reports = linter.standard(matteJSON).reports;

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
        type: 'error',
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
