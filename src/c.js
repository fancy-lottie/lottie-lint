'use strict';

exports.layerMapping = {
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
