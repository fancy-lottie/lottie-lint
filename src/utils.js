
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

export default {
  isImage,
  isPrecomp,
  hasMatte,
  layerMapping,
};
