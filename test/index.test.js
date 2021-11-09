
const assert = require('assert');

import linter from '../src';

describe('linter', function() {
  it('检测样本一', () => {
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
        type: 'error',
        rule: 'warn_matte_not_suggested',
        name: '发射条.png',
        element: {
          asset: 7,
          layer: 2,
        },
      },
      {
        element: {
          asset: -1,
        },
        message: '资产中存在占用内存大的图片，其尺寸超过2048x2048',
        name: '盖子上.png',
        rule: 'large_image_oom',
        type: 'error',
      },
      {
        element: {
          asset: -1,
        },
        message: '资产中存在占用内存大的图片，其尺寸超过1536x1536',
        name: '盖子下.png',
        rule: 'large_image_oom',
        type: 'warn',
      },
      {
        element: {
          asset: -1,
        },
        message: '资产中存在占用内存大的图片，其尺寸超过1024x1024',
        name: '底部.png',
        rule: 'large_image_oom',
        type: 'info',
      },
    ]);
  });

  it('检测样本二', () => {
    const matteJSON = require('./case_data/layerEffects.json');
    const reports = linter(matteJSON).reports;

    assert.deepStrictEqual(reports, [
      {
        message: '“形状” 如果可以转化成 “图片” 运行，性能可以更好',
        type: 'info',
        rule: 'info_layertype_shape',
        name: 'A4',
        element: {
          asset: -1,
          layer: 1,
        },
      },
      {
        message: '“形状” 如果可以转化成 “图片” 运行，性能可以更好',
        type: 'info',
        rule: 'info_layertype_shape',
        name: 'girlcryfont',
        element: {
          asset: -1,
          layer: 4,
        },
      },
      {
        message: '“形状” 如果可以转化成 “图片” 运行，性能可以更好',
        type: 'info',
        rule: 'info_layertype_shape',
        name: 'A9',
        element: {
          asset: -1,
          layer: 5,
        },
      },
      {
        message: '“形状” 如果可以转化成 “图片” 运行，性能可以更好',
        type: 'info',
        rule: 'info_layertype_shape',
        name: 'A8',
        element: {
          asset: -1,
          layer: 6,
        },
      },
      {
        message: '“形状” 如果可以转化成 “图片” 运行，性能可以更好',
        type: 'info',
        rule: 'info_layertype_shape',
        name: 'A7',
        element: {
          asset: -1,
          layer: 7,
        },
      },
      {
        message: '“形状” 如果可以转化成 “图片” 运行，性能可以更好',
        type: 'info',
        rule: 'info_layertype_shape',
        name: 'A6',
        element: {
          asset: -1,
          layer: 8,
        },
      },
      {
        message: '“形状” 如果可以转化成 “图片” 运行，性能可以更好',
        type: 'info',
        rule: 'info_layertype_shape',
        name: 'A5',
        element: {
          asset: -1,
          layer: 9,
        },
      },
      {
        message: '“形状” 如果可以转化成 “图片” 运行，性能可以更好',
        type: 'info',
        rule: 'info_layertype_shape',
        name: 'okay',
        element: {
          asset: -1,
          layer: 10,
        },
      },
      {
        message: 'android不支持图层混合模式-变暗',
        incompatible: [
          'Android',
        ],
        type: 'incompatible',
        rule: 'incompatible_bm',
        name: 'shadow',
        element: {
          asset: -1,
          layer: 11,
        },
      },
      {
        message: '图层存在 “效果” 滤镜，影响渲染性能；在 iOS 和 Android 上不支持',
        incompatible: [
          'Android',
          'iOS',
        ],
        type: 'incompatible',
        rule: 'incompatible_layer_effects',
        name: 'shadow',
        element: {
          asset: -1,
          layer: 11,
        },
      },
      {
        message: '“形状” 如果可以转化成 “图片” 运行，性能可以更好',
        type: 'info',
        rule: 'info_layertype_shape',
        name: 'A10',
        element: {
          asset: -1,
          layer: 12,
        },
      },
    ]);
  });
});
