
import semver from 'semver';
import utils from './utils';

const { layerMapping } = utils;
const RootElement = { asset: -1 };

export default class LottieLint {
  constructor(jsonData) {
    this.json = JSON.parse(JSON.stringify(jsonData));
    this.reports = [];
    this.init();
  }

  init() {
    this.checkVersion();
    this.checkOldFormat();
    this.checkAttrIndIsUndefined();
    this.checkFonts();
    this.checkLayers(this.json.layers, { asset: -1 });
    this.checkAssets();
  }

  checkVersion() {
    if (!semver.gte(this.json.v, '4.4.0')) {
      const report = {
        message: 'Lottie only supports bodymovin >= 4.4.0',
        rule: 'version',
        element: RootElement,
        type: 'warn',
        parentElement: RootElement,
      };

      this.reports.push(report);
      this.json.reports = [ report ];
    }
  }

  // 5.5.0+的识别规则，解决老版本兼容性问题。此规则只在一定区间生效
  checkOldFormat() {
    if (semver.gte(this.json.v, '5.5.0') && semver.lte(this.json.v, '5.6.8')) {
      const jsonData = JSON.stringify(this.json);
      const totalCount = (jsonData.match(/\"e\"/g) || []).length;
      const tmCount = (jsonData.match(/\"ty\"\:\"tm\"/g) || []).length; // tm 自带一个 e 路径变换
      const gsCount = (jsonData.match(/\"ty\"\:\"gs\"/g) || []).length; // gs 自带一个 e 渐变描边
      const gfCount = (jsonData.match(/\"ty\"\:\"gf\"/g) || []).length; // gf 自带一个 e 渐变填充
      const assetCount = this.json.assets.filter(asset => !asset.layers).length; // 资产 每个层自带一个 e
      const diffCount = assetCount + tmCount + gsCount + gfCount; // 汇总所有 e 的 case
      if (totalCount === diffCount) {
        const report = {
          message: '使用插件版本5.5.0+，客户端必须也是5.5.0+，ios/android旧版播放器会闪退',
          rule: 'warn_old_json_format',
          element: RootElement,
          type: 'incompatible',
          name: '风险',
          incompatible: [ 'iOS', 'Web', 'Android' ],
        };
        this.reports.push(report);
        this.json.reports = [ report ];
      }
    }
  }

  // 校验导出的对象是否缺失ind属性，该属性ios播放终端强依赖
  checkAttrIndIsUndefined() {
    let isUndefined = false;
    this.json.layers.forEach(layer => {
      if (layer.ind === undefined) {
        isUndefined = true;
      }
    });
    this.json.assets.forEach(asset => {
      if (asset.layers) {
        asset.layers.forEach(layer => {
          if (layer.ind === undefined) {
            isUndefined = true;
          }
        });
      }
    });
    if (isUndefined) {
      const report = {
        message: '插件导出的lottie缺乏ind属性，会导致ios播放器会出现闪退',
        rule: 'error_attr_ind_isUndefined',
        element: RootElement,
        type: 'error',
        name: '风险',
        incompatible: [ 'iOS' ],
      };
      this.reports.push(report);
      this.json.reports = [ report ];
    }
  }

  // 字体检测
  checkFonts() {
    const fonts = this.json.fonts || {};
    if (Array.isArray(fonts.list) && fonts.list.length > 0) {
      const report = {
        message: '包含字体数据, android 播放器会闪退',
        rule: 'warn_fonts_json',
        element: RootElement,
        type: 'warn',
        name: '风险',
        incompatible: [ 'Android' ],
      };
      this.reports.push(report);
    }
  }

  // 层的分解
  checkLayers(layers, parentElement) {

    // 对assets里面对对象的ip op 进行校正
    const parentNode = utils.getNode(this.json, parentElement);
    if (parentNode.op === undefined) {
      parentNode.ip = 0;
      parentNode.op = utils.getAssetItemOp(this.json, parentNode.id);
    }

    layers.forEach((layer, index) => {
      layer.reports = [];
      const element = {
        ...parentElement,
        layer: index,
      };

      // 校验 部分lottie文件存在无用图层
      if (layer.ip >= parentNode.op) {
        const report = {
          message: '无效图层，进场时间大于动画结束时间，建议删除图层',
          type: 'error',
          rule: 'error_invalid_layer',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // 校验5.6.10bodymovin删除的默认属性导致ios-oc版本无法播放,目前只针对图片检测
      if (layer.ks && layer.ty === 2 && !layer.ks.s) {
        const report = {
          message: '5.6.10以后版本缺省缩放属性导致ios可能无法播放',
          type: 'incompatible',
          incompatible: [ 'iOS' ],
          rule: 'incompatible_keyframes_size_undefined',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // "sr"，时间伸缩属性在三端表现不一致
      if (layer.sr && layer.sr !== 1) {
        const report = {
          message: '时间伸缩的拉伸因子不为100%，客户端可能展示异常',
          type: 'incompatible',
          incompatible: [ 'iOS', 'android', 'web' ],
          rule: 'incompatible_sr_not_100',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // 校验 部分lottie文件存在无用图层
      if (layer.op < 0 || layer.op < parentNode.ip) {
        const report = {
          message: '无效图层，出场的时间小于动画开始时间，建议删除图层',
          type: 'error',
          rule: 'error_invalid_layer',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // LayerType Solid 纯色
      if (layer.ty === layerMapping.LayerType.Solid) {
        const report = {
          message: '“纯色” 隐含 “蒙版” 的能力，有额外性能损耗，尽量改用“形状”来表达',
          type: 'warn',
          rule: 'warn_layertype_solid',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // LayerType Shape 矢量形状
      if (layer.ty === layerMapping.LayerType.Shape) {
        const report = {
          message: '“形状” 如果可以转化成 “图片” 运行，性能可以更好',
          type: 'info',
          rule: 'info_layertype_shape',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // Time Remap 时间映射
      if (layer.ty === layerMapping.LayerType.Precomp && layer.tm) {
        const report = {
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
        const report = {
          message: '图层存在 “遮罩层” 特性，极其损耗性能，建议不使用，或用 “蒙版” 替代',
          type: 'error',
          rule: 'warn_matte_not_suggested',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // Auto Orient 自动定向
      if (layer.ao) {
        const report = {
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

      // mask 蒙版
      if (layer.hasMask) {
        const report = {
          message: '图层的存在 “蒙版”，对运行性能有一定影响，请审视必要性',
          type: 'info',
          rule: 'info_mask_mode',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // 蒙版的各种模式校验
      if (layer.masksProperties && layer.masksProperties.length > 0) {
        layer.masksProperties.forEach((mask, j) => {
          element.mask = j;

          let report = null;
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
                message: '图层蒙版中存在 “差值” 的混合模式，在 Web、iOS 上不支持',
                type: 'incompatible',
                incompatible: [ 'Web', 'iOS' ],
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

      // Layer Effects 滤镜
      if (layer.ef) {
        const report = {
          message: '图层存在 “效果” 滤镜，影响渲染性能；在 iOS 和 Android 上不支持',
          type: 'incompatible',
          incompatible: [ 'Android', 'iOS' ],
          rule: 'incompatible_layer_effects',
          name: layer.nm,
          element,
        };
        layer.reports.push(report);
        this.reports.push(report);
      }

      // 对形状图层进行递归式遍历
      if (layer.shapes) {
        this.checkShapes(layer.shapes, element);
      }
    });
  }

  checkAssets() {
    const assets = this.json.assets || [];
    assets.forEach((asset, index) => {
      if (!utils.isPrecomp(asset)) return;
      this.checkLayers(asset.layers, { asset: index });
    });
  }

  /**
   * 对形状类型的遍历
   * @param {*} shapes 形状对象
   * @param {*} parentElement 父节点
   * @param {*} isGroup 是否是“编组”
   */
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
      // 对编组做“递归”处理
      if (shape.ty === 'gr') {
        this.checkShapes(shape.it, element, true);
      }
      // 检测出“渐变效果”是否异常，如果出现"纯白-纯黑"渐变，引导设计师操作
      if (shape.ty === 'gf' || shape.ty === 'gs') {
        if (shape.g && shape.g.k.k && shape.g.k && shape.g.k.k && shape.g.k.k.toString() === '0,1,1,1,1,0,0,0') {
          const report = {
            message: '渐变的绘制存在乱码异常',
            type: 'warn',
            rule: 'warn_gradient_warn',
            name: shape.nm,
            element,
          };
          shape.reports.push(report);
          this.reports.push(report);
        }
      }
      if (shape.ty === 'gs') {
        const report = {
          message: '形状图层的渐变描边，在 iOS 上不支持',
          type: 'incompatible',
          incompatible: [ 'iOS' ],
          rule: 'incompatible_gradient_strokes',
          name: shape.nm,
          element,
        };
        shape.reports.push(report);
        this.reports.push(report);
      }
      if (shape.ty === 'rd') {
        if (shape.r && shape.r.k !== 0) {
          const report = {
            message: '矩形的圆角设置，在 iOS、Android 上不支持，导致部分机型绘制错误',
            type: 'incompatible',
            incompatible: [ 'iOS', 'Android' ],
            rule: 'incompatible_rounded_corners',
            name: shape.nm,
            element,
          };
          shape.reports.push(report);
          this.reports.push(report);
        }
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
