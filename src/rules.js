'use strict';

const semver = require('semver');

module.exports = {
  version(json) {
    if (!semver.gte(json.v, '4.4.0')) {
      const report = {
        message: 'Lottie only supports bodymovin >= 4.4.0',
        rule: 'version',
      };

      json.report = report;
      return report;
    }
  },

  invalid_layer(json) {
    const layers = json.layers;
    layers.forEach(layer => {
      // 校验 部分lottie文件存在无用图层
      if (layer.st >= json.op) {
        const report = {
          message: 'lottie invalid layer',
          rule: 'invalid_layer',
          name: layer.nm,
        };
        layer.report = report;

        return report;
      }
    });
  },
};
