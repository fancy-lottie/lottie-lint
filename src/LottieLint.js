'use strict';

const semver = require('semver');
const utils = require('./utils');
const { layerMapping } = require('./c');

class LottieLint {
  constructor(jsonData) {
    this.json = JSON.parse(JSON.stringify(jsonData));
    this.reports = [];
    this.init();
  }

  init() {
    this.checkVersion();
    this.checkLayers(this.json.layers);
    this.checkAssets();
  }

  checkVersion() {
    if (!semver.gte(this.json.v, '4.4.0')) {
      const report = {
        message: 'Lottie only supports bodymovin >= 4.4.0',
        rule: 'version',
        path: '#',
      };

      this.reports.push(report);
      this.json.report = [ report ];
    }
  }

  checkLayers(layers, prePath = '') {
    layers.forEach((layer, index) => {
      layer.report = [];
      const path = prePath ? `${prePath}/layers[${index}]` : `#/layers[${index}]`;
      // 校验 部分lottie文件存在无用图层
      if (layer.st >= this.json.op) {
        const report = {
          message: '当前图层进场时间大于动画结束时间，建议删除图层',
          rule: 'invalid_layer',
          name: layer.nm,
          path,
        };
        layer.report.push(report);
        this.reports.push(report);
      }

      // Time Stretch
      if (layer.sr !== 1) {
        const report = {
          message: '兼容性警告⚠️: 当前图层存在 Time Stretch 属性， 在 iOS 上不支持',
          rule: 'incompatible_time_stretch',
          name: layer.nm,
          path,
        };
        layer.report.push(report);
        this.reports.push(report);
      }

      // Time Remap
      if (layer.ty === layerMapping.LayerType.Precomp && layer.tm) {
        const report = {
          message: '兼容性警告⚠️: 当前图层存在 Time Remap 属性， 在 iOS 上不支持',
          rule: 'incompatible_time_remap',
          name: layer.nm,
          path,
        };
        layer.report.push(report);
        this.reports.push(report);
      }

      // Text
      if (layer.ty === layerMapping.LayerType.Text) {
        const report = {
          message: '兼容性警告⚠️: 当前图层为 Text，在 iOS 上完全不支持，在 Android 上只支持 Glyphs, Fonts, Transform, Fill, Stroke, Tracking',
          rule: 'incompatible_text',
          name: layer.nm,
          path,
        };
        layer.report.push(report);
        this.reports.push(report);
      }

      // 存在遮罩层 应该进行提示
      if (utils.hasMatte(layer)) {
        const report = {
          message: '兼容性警告⚠️: 当前图层存在遮罩层，建议使用蒙版替代',
          rule: 'incompatible_matte_not_suggested',
          name: layer.nm,
          path,
        };
        layer.report.push(report);
        this.reports.push(report);
      }

      // Auto Orient
      if (layer.ao) {
        const report = {
          message: '兼容性警告⚠️: 当前图层存在 Auto Orient 属性，在 Web 和 Android 上不支持',
          rule: 'incompatible_auto_orient',
          name: layer.nm,
          path,
        };
        layer.report.push(report);
        this.reports.push(report);
      }

      // mask
      if (layer.hasMask) {
        let report;
        layer.masksProperties.forEach((mask, j) => {
          if (mask.mode === layerMapping.maskMode.Intersect) {
            report = {
              message: '兼容性警告⚠️: 当前图层的 Masks 模式为 Intersect，在 Web 上不支持',
              rule: 'incompatible_mask_mode',
              name: layer.nm,
              path: `${path}/mask[${j}]`,
            };
          } else if (mask.mode === layerMapping.maskMode.Lighten) {
            report = {
              message: '兼容性警告⚠️: 当前图层的 Masks 模式为 Lighten，完全不支持',
              rule: 'incompatible_mask_mode',
              name: layer.nm,
              path: `${path}/mask[${j}]`,
            };
          } else if (mask.mode === layerMapping.maskMode.Darken) {
            report = {
              message: '兼容性警告⚠️: 当前图层的 Masks 模式为 Darken，完全不支持',
              rule: 'incompatible_mask_mode',
              name: layer.nm,
              path: `${path}/mask[${j}]`,
            };
          } else if (mask.mode === layerMapping.maskMode.Difference) {
            report = {
              message: '兼容性警告⚠️: 当前图层的 Masks 模式为 Difference，完全不支持',
              rule: 'incompatible_mask_mode',
              name: layer.nm,
              path: `${path}/mask[${j}]`,
            };
          }
          layer.report.push(report);
          this.reports.push(report);
        });
      }

      // Layer Effects
      if (layer.ef) {
        const report = {
          message: '兼容性警告⚠️: 当前图层存在 Layer Effects，在 iOS 和 Android 上不支持',
          rule: 'incompatible_layer_effects',
          name: layer.nm,
          path,
        };
        layer.report.push(report);
        this.reports.push(report);
      }

      if (layer.shapes) {
        this.checkShapes(layer.shapes, `#/layers[${index}]`);
      }
    });
  }

  checkAssets() {
    const assets = this.json.assets;
    assets.forEach((asset, index) => {
      if (!utils.isPrecomp(asset)) return;
      this.checkLayers(asset.layers, `#/assets[${index}]`);
    });
  }

  checkShapes(shapes, prePath = '') {
    shapes.forEach((shape, i) => {
      shape.report = [];
      if (shape.ty === 'gr') {
        this.checkShapes(shape.it, `${prePath}/shape[${i}]`);
      }
      if (shape.ty === 'gs') {
        const report = {
          message: '兼容性警告⚠️: 当前形状 Gradient Strokes，在 iOS 上不支持',
          rule: 'incompatible_gradient_strokes',
          name: shape.nm,
          path: `${prePath}/shape[${i}]`,
        };
        shape.report.push(report);
        this.reports.push(report);
      }
      if (shape.type === 'mm') {
        const report = {
          message: '兼容性警告⚠️: Merge Paths， 在 iOS 和 Web 上不支持',
          rule: 'incompatible_merge_paths',
          name: shape.nm,
          path: `${prePath}/shape[${i}]`,
        };
        shape.report.push(report);
        this.reports.push(report);
      }
    });
  }

  getResult() {
    return {
      json: this.json,
      reports: this.reports,
    };
  }
}

module.exports = LottieLint;
