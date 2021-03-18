import { hasOverflowImage, resetImageSize } from './utils/resetImageSize';
import { hasImageBlank, resetImageBlank, hasImageBlankForLint } from './utils/resetImageBlank';

const isImage = asset => {
  if (!asset) throw new Error('invel asset');

  if (asset.h && asset.w && asset.p && asset.u) return true;

  return false;
};

const isPrecomp = asset => {
  if (!asset) throw new Error('invalid asset');

  // 判断是否是元件
  if (Array.isArray(asset.layers) && asset.layers.length) return true;

  return false;
};

const hasMatte = layer => {
  if (layer && layer.tt) return true;
  return false;
};

const layerMapping = {
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
};

// 获取assetsItem的帧结束时间, 注: 帧的结束时间取自层的(op-st)/sr;
const getAssetItemOp = (lottieFile, id) => {
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
};

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
const getNode = (lottieFile, Element) => {
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
};

// 静态图层总数统计 (静态图层是指名义上的layers总数，性能相关的运行状态另外计算)
const layersCount = lottieFile => {
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
};

// TODO: 统计绘制面积
const areaStatistics = lottieFile => {
  lottieFile.layers.forEach(item => {
    return item;
  });
};

/**
 * 返回指定layer的直系儿子节点
 * @param {*} layers 必须填写
 * @param {*} layer 必须填写
 */
const getLayerChildren = (layers, layer) => {
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
};

// 获取子合成的名字
const getAssetItemName = (lottieFile, id) => {
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
};

export default {
  getAssetItemOp,
  getNode,
  isImage,
  isPrecomp,
  hasMatte,
  layerMapping,
  layersCount, // 图层统计
  areaStatistics, // 绘制面积统计
  getLayerChildren,
  getAssetItemName,
  hasOverflowImage,
  resetImageSize,
  hasImageBlank,
  resetImageBlank,
  hasImageBlankForLint,
};
