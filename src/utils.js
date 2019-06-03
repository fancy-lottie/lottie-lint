'use strict';

exports.isImage = function(asset) {
  if (!asset) throw new Error('invel asset');

  if (asset.h && asset.w && asset.p && asset.u) return true;

  return false;
};

exports.isPrecomp = function(asset) {
  if (!asset) throw new Error('invalid asset');

  // 判断是否是元件
  if (Array.isArray(asset.layers) && asset.layers.length) return true;

  return false;
};

exports.hasMatte = function(layer) {
  if (layer && layer.tt) return true;
  return false;
};
