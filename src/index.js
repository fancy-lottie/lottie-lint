
const semver = require('semver');
const utils = require('./utils');

module.exports = function(jsonData) {
  const json = JSON.parse(JSON.stringify(jsonData));
  const reports = [];

  // Lottie only supports bodymovin >= 4.4.0
  if (!semver.gte(json.v, '4.4.0')) {
    const report = {
      message: 'Lottie only supports bodymovin >= 4.4.0',
      rule: 'version',
      path: '#',
    };

    reports.push(report);
    json.report = report;
  }

  const layers = json.layers;
  layers.forEach((layer, index) => {
    // 校验 部分lottie文件存在无用图层
    if (layer.st >= json.op) {
      const report = {
        message: '当前图层进场时间大于动画结束时间，建议删除图层',
        rule: 'invalid_layer',
        name: layer.nm,
        path: `#/layers[${index}]`,
      };
      layer.report = report;

      reports.push(report);
    }

    // 存在遮罩层 应该进行提示
    if (utils.hasMatte(layer)) {
      const report = {
        message: '当前图层存在遮罩层，建议使用蒙版替代',
        rule: 'matte_not_suggested',
        name: layer.nm,
        path: `#/layers[${index}]`,
      };
      layer.report = report;
      reports.push(report);
    }
  });

  json.assets.forEach((asset, index) => {
    if (!utils.isPrecomp(asset)) return;

    asset.layers.forEach((layer, j) => {
      if (utils.hasMatte(layer)) {
        const report = {
          message: '当前图层存在遮罩层，建议使用蒙版替代',
          rule: 'matte_not_suggested',
          name: layer.nm,
          path: `#/assets[${index}]/layers[${j}]`,
        };
        layer.report = report;
        reports.push(report);
      }
    });
  });

  return {
    json,
    reports,
  };
}
