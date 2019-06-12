'use strict';

const assert = require('assert');

const linter = require('../src/index');

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
        message: '形状图层的 Merge Paths， 在 iOS 和 Web 上不支持',
        type: 'incompatible',
        incompatible: [
          'Web',
          'iOS',
        ],
        rule: 'incompatible_merge_paths',
        name: '合并路径 1',
        element: {
          asset: -1,
          layer: 4,
          shape: 0,
          groupIt: 3,
        },
      },
      {
        message: '形状图层的 Merge Paths， 在 iOS 和 Web 上不支持',
        type: 'incompatible',
        incompatible: [
          'Web',
          'iOS',
        ],
        rule: 'incompatible_merge_paths',
        name: '合并路径 1',
        element: {
          asset: -1,
          layer: 4,
          shape: 1,
          groupIt: 7,
        },
      },
      {
        message: '形状图层的 Merge Paths， 在 iOS 和 Web 上不支持',
        type: 'incompatible',
        incompatible: [
          'Web',
          'iOS',
        ],
        rule: 'incompatible_merge_paths',
        name: '合并路径 1',
        element: {
          asset: -1,
          layer: 4,
          shape: 2,
          groupIt: 3,
        },
      },
      {
        message: '形状图层的 Merge Paths， 在 iOS 和 Web 上不支持',
        type: 'incompatible',
        incompatible: [
          'Web',
          'iOS',
        ],
        rule: 'incompatible_merge_paths',
        name: '合并路径 1',
        element: {
          asset: -1,
          layer: 4,
          shape: 3,
          groupIt: 3,
        },
      },
      {
        message: '形状图层的 Merge Paths， 在 iOS 和 Web 上不支持',
        type: 'incompatible',
        incompatible: [
          'Web',
          'iOS',
        ],
        rule: 'incompatible_merge_paths',
        name: '合并路径 1',
        element: {
          asset: -1,
          layer: 4,
          shape: 4,
          groupIt: 12,
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
        message: '形状图层的 Merge Paths， 在 iOS 和 Web 上不支持',
        type: 'incompatible',
        incompatible: [
          'Web',
          'iOS',
        ],
        rule: 'incompatible_merge_paths',
        name: '合并路径 1',
        element: {
          asset: -1,
          layer: 10,
          shape: 1,
          groupIt: 3,
        },
      },
      {
        message: '形状图层的 Merge Paths， 在 iOS 和 Web 上不支持',
        type: 'incompatible',
        incompatible: [
          'Web',
          'iOS',
        ],
        rule: 'incompatible_merge_paths',
        name: '合并路径 1',
        element: {
          asset: -1,
          layer: 10,
          shape: 5,
          groupIt: 4,
        },
      },
      {
        message: '形状图层的 Merge Paths， 在 iOS 和 Web 上不支持',
        type: 'incompatible',
        incompatible: [
          'Web',
          'iOS',
        ],
        rule: 'incompatible_merge_paths',
        name: '合并路径 1',
        element: {
          asset: -1,
          layer: 10,
          shape: 6,
          groupIt: 4,
        },
      },
      {
        message: '形状图层的 Merge Paths， 在 iOS 和 Web 上不支持',
        type: 'incompatible',
        incompatible: [
          'Web',
          'iOS',
        ],
        rule: 'incompatible_merge_paths',
        name: '合并路径 1',
        element: {
          asset: -1,
          layer: 10,
          shape: 7,
          groupIt: 2,
        },
      },
      {
        message: '图层存在 “效果” 滤镜，影响渲染性能',
        type: 'info',
        rule: 'info_layer_effects',
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
