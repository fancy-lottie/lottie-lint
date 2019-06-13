'use strict';

const semver = require('semver');
const utils = require('./utils');
const { layerMapping } = require('./c');
const RootElement = { asset: -1 };

class LottieLint {
  constructor(jsonData) {
    this.json = JSON.parse(JSON.stringify(jsonData));
    this.reports = [];
    this.init();
  }

  init() {
    this.checkVersion();
    this.checkOldFormat();
    this.checkLayers(this.json.layers, { asset: -1 });
    this.checkAssets();
  }

  checkVersion() {
    if (!semver.gte(this.json.v, '4.4.0')) {
      const report = {
        message: 'Lottie only supports bodymovin >= 4.4.0',
        rule: 'version',
        element: RootElement,
        parentElement: RootElement,
      };

      this.reports.push(report);
      this.json.reports = [ report ];
    }
  }

  checkOldFormat() {
    if (semver.gte(this.json.v, '5.5.0')) {
      const jsonData = JSON.stringify(this.json);
      const totalCount = (jsonData.match(/\"e\"/g) || []).length;
      const assetCount = this.json.assets.filter(asset => !asset.layers).length;
      if (totalCount === assetCount) {
        const report = {
          message: '使用了bodymovin 5.5.* 的版本导出 lottie json 文件, 但是没有勾选 Export old JSON format, 导致老版本(5.5.0以下)播放器无法播放',
          rule: 'incompatible_old_json_format',
          element: RootElement,
          type: 'incompatible',
          incompatible: [ 'iOS', 'Web', 'Android' ],
        };
        this.reports.push(report);
        this.json.reports = [ report ];
      }
    }
  }

  checkLayers(layers, parentElement) {
    layers.forEach((layer, index) => {
      layer.reports = [];
      let report;
      const element = {
        ...parentElement,
        layer: index,
      };

      // 校验 部分lottie文件存在无用图层
      if (layer.st >= this.json.op) {
        report = {
          message: '无效图层，进场时间大于动画结束时间，建议删除图层',
          type: 'error',
          rule: 'error_invalid_layer',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // 校验 部分lottie文件存在无用图层
      if (layer.op < 0 && layer.op < this.json.ip) {
        report = {
          message: '无效图层，出场的时间小于动画开始时间，建议删除图层',
          type: 'error',
          rule: 'error_invalid_layer',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // LayerType Solid
      if (layer.ty === layerMapping.LayerType.Solid) {
        report = {
          message: '“纯色” 默认包含蒙版的能力，对性能有额外损耗，尽量改用“形状”来表达',
          type: 'warn',
          rule: 'warn_layertype_solid',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // LayerType Shape
      if (layer.ty === layerMapping.LayerType.Shape) {
        report = {
          message: '“形状” 如果可以转化成 “图片” 运行，性能可以更好',
          type: 'info',
          rule: 'info_layertype_shape',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // Time Stretch
      if (layer.sr !== 1) {
        report = {
          message: '图层使用 “时间伸缩” 特性，在 iOS 上不支持',
          type: 'incompatible',
          incompatible: [ 'iOS' ],
          rule: 'incompatible_time_stretch',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // Time Remap
      if (layer.ty === layerMapping.LayerType.Precomp && layer.tm) {
        report = {
          message: '图层使用 “时间重映射” 特性，在 iOS 上不支持',
          type: 'incompatible',
          incompatible: [ 'iOS' ],
          rule: 'incompatible_time_remap',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // TODO: Text 重新细化处理
      // if (layer.ty === layerMapping.LayerType.Text) {
      //   const report = {
      //     message: '文字图层，在iOS、 Android 上只支持 Glyphs, Fonts, Transform, Fill, Stroke, Tracking',
      //     type: 'incompatible',
      //     incompatible: ['iOS', 'Android'],
      //     rule: 'incompatible_text',
      //     name: layer.nm,
      //     path,
      //   };
      //   layer.reports.push(report);
      //   this.reports.push(report);
      // }

      // 存在遮罩层 应该进行提示
      if (utils.hasMatte(layer)) {
        report = {
          message: '图层存在 “遮罩层” 特性，极其损耗性能，建议不使用，或用 “蒙版” 替代',
          type: 'warn',
          rule: 'warn_matte_not_suggested',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // Auto Orient
      if (layer.ao) {
        report = {
          message: '图层存在 “自动定向” 特性，在 Web 和 Android 上不支持',
          type: 'incompatible',
          incompatible: [ 'Web', 'Android' ],
          rule: 'incompatible_auto_orient',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // mask
      if (layer.hasMask) {
        report = {
          message: '图层的存在 “蒙版”，对运行性能有一定影响，请审视必要性',
          type: 'info',
          rule: 'info_mask_mode',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      if (layer.masksProperties && layer.masksProperties.length > 0) {
        let report = null;
        layer.masksProperties.forEach((mask, j) => {
          element.mask = j;
          switch (mask.mode) {
            case layerMapping.maskMode.Intersect: {
              report = {
                message: '图层蒙版中存在 “相交” 的混合模式，在 Web 上不支持',
                type: 'incompatible',
                incompatible: [ 'Web' ],
                rule: 'incompatible_mask_mode',
                name: layer.nm,
                element,
              };
              break;
            }
            case layerMapping.maskMode.Lighten: {
              report = {
                message: '图层蒙版中存在 “变亮” 的混合模式，目前所有终端都不支持',
                type: 'incompatible',
                incompatible: [ 'Web', 'Android', 'iOS' ],
                rule: 'incompatible_mask_mode',
                name: layer.nm,
                element,
              };
              break;
            }
            case layerMapping.maskMode.Darken: {
              report = {
                message: '图层的 Masks 模式为 Darken，完全不支持',
                type: 'incompatible',
                incompatible: [ 'Web', 'Android', 'iOS' ],
                rule: 'incompatible_mask_mode',
                name: layer.nm,
                element,
              };
              break;
            }
            case layerMapping.maskMode.Difference: {
              report = {
                message: '图层蒙版中存在 “差值” 的混合模式，目前所有终端都不支持',
                type: 'incompatible',
                incompatible: [ 'Web', 'Android', 'iOS' ],
                rule: 'incompatible_mask_mode',
                name: layer.nm,
                element,
              };
              break;
            }
            default: break;
          }

          if (report) {
            layer.reports.push(report);
            this.reports.push(report);
          }
        });
      }

      // Layer Effects
      if (layer.ef) {
        report = {
          message: '图层存在 “效果” 滤镜，在 iOS 和 Android 上不支持',
          type: 'incompatible',
          incompatible: [ 'Android', 'iOS' ],
          rule: 'incompatible_layer_effects',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        report = {
          message: '图层存在 “效果” 滤镜，影响渲染性能',
          type: 'info',
          rule: 'info_layer_effects',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      if (layer.shapes) {
        this.checkShapes(layer.shapes, element);
      }
    });
  }

  checkAssets() {
    const assets = this.json.assets;
    assets.forEach((asset, index) => {
      if (!utils.isPrecomp(asset)) return;
      this.checkLayers(asset.layers, { asset: index });
    });
  }

  checkShapes(shapes, parentElement, isGroup) {
    shapes.forEach((shape, i) => {
      shape.reports = [];
      // 如果是gr，那么属性进阶一层
      const element = isGroup ? {
        ...parentElement,
        groupIt: i,
      } : {
        ...parentElement,
        shape: i,
      };
      if (shape.ty === 'gr') {
        this.checkShapes(shape.it, element, true);
      }
      if (shape.ty === 'gs') {
        const report = {
          message: '形状图层的 Gradient Strokes，在 iOS 上不支持',
          type: 'incompatible',
          incompatible: [ 'iOS' ],
          rule: 'incompatible_gradient_strokes',
          name: shape.nm,
          element,
        };
        shape.reports.push(report);
        this.reports.push(report);
      }
      if (shape.ty === 'mm') {
        const report = {
          message: '形状图层的 Merge Paths， 在 iOS 和 Web 上不支持',
          type: 'incompatible',
          incompatible: [ 'Web', 'iOS' ],
          rule: 'incompatible_merge_paths',
          name: shape.nm,
          element,
        };
        shape.reports.push(report);
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
