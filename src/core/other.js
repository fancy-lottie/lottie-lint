/**
 * 除了基础规则以外的指标约束
 * @水映天辙
 */

import util from '../util';

// 遍历图片图层的第一帧的宽高
const getFirstWHSize = item => {
  let w = 100;
  let h = 100;
  // TODO: 图片只是初始化属性的设置
  const itemSK = item.ks && item.ks.s && item.ks.s.k && item.ks.s.k;
  if (itemSK && itemSK.length) {
    if (typeof itemSK[0] === 'number') {
      w = Math.abs(itemSK[0]);
      h = Math.abs(itemSK[1]);
    } else {
      w = Math.abs(itemSK[0].s[0]);
      h = Math.abs(itemSK[0].s[1]);
    }
  }
  // 如果捕获不到s属性，说明是默认的[100, 100, 100];
  return { w: w / 100, h: h / 100 };
}

export default class LottieLintOther {
  constructor(jsonData) {
    this.json = JSON.parse(JSON.stringify(jsonData));
    this.reports = [];
    this.init();
  }

  init() {
    // 初始化处理;
    this.countRAM();
  }

  // 测量图片图层对内存和GPU的压力
  countRAM() {
    const lottieFile = this.json;
    const startRAM = []; // 初始化的内存消耗，最终输出number（单位beta）;
    const runtimeRAM = []; // 运行时的内存消耗，最终输出是[number,number]
    const maxRAM = []; // 最大内存消耗，最终输出number（单位beta）;
    function roopLayers(compnent, ip, op) {
      compnent.layers.forEach(layer => {
        // 图片内存消耗的统计
        if (layer.ty === 2) {
          const { w, h } = util.getAssetsItemFundById(lottieFile, layer.refId);
          const imageArea = w * h;
          // 启动内存队列
          const firstWH = getFirstWHSize(layer);
          const firstFrameRAM = firstWH.w * firstWH.h * imageArea;
          startRAM.push(firstFrameRAM);

          // 最大内存队列
          const maxWH = util.getMaxWHSize(layer);
          maxRAM.push(maxWH.w * maxWH.h * imageArea);

          // 运行时内存消耗队列
          const tempRuntimeRAM = [];
          const newIp = ip + layer.ip;
          const newOp = op + layer.op;
          for (let i = 0; i < newOp; i++) {
            if (i < newIp) {
              tempRuntimeRAM.push(firstFrameRAM);
            } else {
              tempRuntimeRAM.push(imageArea);
            }
          }
          runtimeRAM.push(tempRuntimeRAM);
        }
        // 合成会走递归
        if (layer.ty === 0) {
          const preComp = util.getAssetsItemFundById(lottieFile, layer.refId);
          const newIp = layer.ip + layer.st + ip;
          const newOp = layer.ip + layer.st + op;
          roopLayers(preComp, newIp, newOp);
        }
      });
    }
    roopLayers(lottieFile, 0, 0);
    return {
      startRAM,
      runtimeRAM,
      maxRAM,
      sumStartRAM: util.sumArray(startRAM),
      sumMaxRAM: util.sumArray(maxRAM),
    };
  }

  getResult() {
    return {
      json: this.json,
      reports: this.reports,
    };
  }
}
