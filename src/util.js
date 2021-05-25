import { hasOverflowImage, resetImageSize } from './utils/resetImageSize';
import { hasImageBlank, resetImageBlank, hasImageBlankForLint } from './utils/resetImageBlank';

/**
 * 工具库
 */
export default {
  layerMapping: {
    LayerType: {
      Precomp: 0, // 合成
      Solid: 1, // 纯色 (默认包含蒙版)
      Image: 2, // 图片
      Null: 3, // 空
      Shape: 4, // 形状
      Text: 5, // 文本
      Unknown: 6, // 空
    },
    MatteType: {
      None: 0, // 空
      Add: 1, // 叠加
      Invert: 2,
      Unknown: 3,
    },
    maskMode: {
      None: 'n',
      Additive: 'a',
      Subtract: 's',
      Intersect: 'i',
      Lighten: 'l',
      Darken: 'd',
      Difference: 'f',
    },
  },

  // 判断资源是否是图片类型
  isImage(asset) {
    if (!asset) throw new Error('invel asset');
    if (asset.h && asset.w && asset.p && asset.u) return true;
    return false;
  },

  // 判断是否是预合成
  isPrecomp(asset) {
    if (!asset) throw new Error('invalid asset');
    if (Array.isArray(asset.layers) && asset.layers.length) return true;
    return false;
  },

  // 判断图层是否存在遮罩层
  hasMatte(layer) {
    if (layer && layer.tt) return true;
    return false;
  },

  // 数组加和
  sumArray(arr) {
    let sum = 0;
    arr.forEach(i => {
      sum += i;
    });
    return sum;
  },

  // 获取assetsItem的帧结束时间, 注: 帧的结束时间取自层的(op-st)/sr;
  getAssetItemOp(lottieFile, id) {
    let op = 0;
    // 主layers遍历
    lottieFile.layers.forEach(item => {
      if (item.refId === id) {
        op = (item.op - item.st) / item.sr;
      }
    });
    if (!op) {
      // assets的layers遍历
      lottieFile.assets.forEach(asset => {
        asset.layers && asset.layers.forEach(item => {
          if (item.refId === id) {
            op = (item.op - item.st) / item.sr;
          }
        });
      });
    }
    return op;
  },

  /**
   * 获取对象节点: 未完成版本
   * @param {object} lottieFile lottie文件
   * @param {object} Element
   * interface Element {  // 坐标系可以表达任意位置的element
   *   asset: Number;  // -1～∞，其中-1代表lottie，0～∞代表lottie.assets[asset]
   *   layer: Number;  // 非必填属性 undefined || 0～∞，代表asset.layers[layer]
   *   shape: Number;  // 非必填属性 undefined || 0～∞，代表layer.shapes[shape]
   *   groupIt: Number;  // 非必填属性 undefined || 0～∞，代表shape.gr.it[groupIt]
   *   mask: Number;  // 非必填属性 undefined || 0～∞，代layer.masksProperties[mask]
   *   type: String;  // 非必填属性 undefined || 类型，用于辅助快速定位，在结构化以后会帮忙导出
   *   ty: String;  // 非必填属性 undefined || 类型，type的辅助属性
   * }
   **/
  getNode(lottieFile, Element) {
    let node = lottieFile;
    function deepGet(preNode, ele, type) {
      let element = preNode;
      const eleType = ele[type];
      if (eleType !== undefined && eleType !== -1) {
        switch (type) {
          case 'mask':
            element = preNode.masksProperties[eleType];
            break;
          case 'groupIt':
            element = preNode.gr.it[eleType];
            break;
          default:
            element = preNode[`${type}s`][eleType];
            break;
        }
      }
      return element;
    }
    node = deepGet(node, Element, 'asset');
    node = deepGet(node, Element, 'layer');
    node = deepGet(node, Element, 'shape');
    node = deepGet(node, Element, 'groupIt');
    node = deepGet(node, Element, 'mask');
    return node;
  },

  // 静态图层总数统计 (静态图层是指名义上的layers总数，性能相关的运行状态另外计算)
  layersCount(lottieFile) {
    let count = 0;
    lottieFile.layers.forEach(() => {
      count += 1;
    });
    lottieFile.assets.forEach(asset => {
      if (asset.layers) {
        asset.layers.forEach(() => {
          count += 1;
        });
      }
    });
    return count;
  },

  // TODO: 统计绘制面积
  areaStatistics(lottieFile) {
    lottieFile.layers.forEach(item => {
      return item;
    });
  },

  /**
   * 返回指定layer的直系儿子节点
   * @param {*} layers 必须填写
   * @param {*} layer 必须填写
   */
  getLayerChildren(layers, layer) {
    if (!layers || !layers.length) {
      return [];
    }
    const children = [];
    const baseLayers = JSON.parse(JSON.stringify(layers));
    baseLayers.forEach(item => {
      if (item.parent === layer.ind) {
        children.push(item);
      }
    });
    return children;
  },

  // 获取子合成的名字
  getAssetItemName(lottieFile, id) {
    let name;
    lottieFile.layers.forEach(item => {
      if (item.refId === id) {
        name = item.nm;
      }
    });
    lottieFile.assets.forEach(asset => {
      if (asset.layers) {
        asset.layers.forEach(item => {
          if (item.refId === id) {
            name = item.nm;
          }
        });
      }
    });
    return name;
  },

  // 根据id获取指定的assetItem的下标
  getAssetsItemIndexFundById(lottieFile, id) {
    let zindex = 0;
    lottieFile.assets.forEach((item, index) => {
      if (item.id === id) {
        zindex = index;
      }
    });
    return zindex;
  },

  // 根据id获取指定的assetItem
  getAssetsItemFundById(lottieFile, id) {
    if (id === undefined || id < 0) {
      return lottieFile;
    }
    const zindex = this.getAssetsItemIndexFundById(lottieFile, id);
    return lottieFile.assets[zindex];
  },

  // 遍历图片图层的关键帧和属性，获取当前图层的极大值
  getMaxWHSize(item) {
    let w = 100;
    let h = 100;
    // TODO: 图片只是初始化属性的设置
    const itemSK = item.ks && item.ks.s && item.ks.s.k && item.ks.s.k;
    if (itemSK && itemSK.length) {
      if (typeof itemSK[0] === 'number') {
        w = Math.abs(itemSK[0]);
        h = Math.abs(itemSK[1]);
      } else {
        itemSK.forEach(it => {
          if (it.s && it.s[0] !== undefined) {
            const e0 = Math.abs(it.e && it.e[0]) || 0;
            const e1 = Math.abs(it.e && it.e[1]) || 0;
            w = Math.max(Math.abs(it.s && it.s[0]), e0, w);
            h = Math.max(Math.abs(it.s && it.s[1]), e1, h);
          }
        });
      }
    }
    return { w: w / 100, h: h / 100 };
  },

  hasOverflowImage, // 判断是否存在超尺寸的图片
  resetImageSize, // 重新设置lottie中超尺寸的图片
  hasImageBlank, // 判断图片是否存在空白
  resetImageBlank, // 重新设置图片的空白
  hasImageBlankForLint, // 为lint定义的图片空白测量
};
