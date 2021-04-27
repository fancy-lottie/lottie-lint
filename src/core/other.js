/**
 * 除了基础规则以外的指标约束
 * @水映天辙
 */

// 根据id获取指定的assetItem
const getAssetsItemFundById = (lottieFile, id) => {
  if (id === undefined || id < 0) {
    return lottieFile;
  }
  const zindex = this.getAssetsItemIndexFundById(lottieFile, id);
  return lottieFile.assets[zindex];
};


// 遍历图片图层的关键帧和属性，获取当前图层的极大值
const getMaxWHSize = item => {
  let w = 0;
  let h = 0;
  // TODO: 图片只是初始化属性的设置
  const itemSK = item.ks && item.ks.s && item.ks.s.k && item.ks.s.k;
  if (itemSK && itemSK.length) {
    if (typeof itemSK[0] === 'number') {
      return [ Math.abs(itemSK[0]), Math.abs(itemSK[1]) ];
    }
    itemSK.forEach(it => {
      if (it.s && it.s[0] !== undefined) {
        w = Math.max(Math.abs(it.s && it.s[0]), Math.abs(it.e && it.e[0]), w);
        h = Math.max(Math.abs(it.s && it.s[1]), Math.abs(it.e && it.e[1]), h);
      }
    });
  }
  return [ w, h ];
}

// 遍历图片图层的第一帧的宽高
const getFirstWHSize = item => {
  // TODO: 图片只是初始化属性的设置
  const itemSK = item.ks && item.ks.s && item.ks.s.k && item.ks.s.k;
  if (itemSK && itemSK.length) {
    if (typeof itemSK[0] === 'number') {
      return [ Math.abs(itemSK[0]), Math.abs(itemSK[1]) ];
    }
    return [ Math.abs(itemSK[0].s[0]), Math.abs(itemSK[0].s[1]) ];
  }
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

  countRAM() {
    const lottieFile = this.json;
    const startRAM = []; // 初始化的内存消耗，最终输出number（单位beta）;
    const runtimeRAM = []; // 运行时的内存消耗，最终输出是[number,number]
    const maxRAM = []; // 最大内存消耗，最终输出number（单位beta）;
    function roopLayers(compnent, ip, op) {
      compnent.layers.forEach(layer => {
        // 图片内存消耗的统计
        if (layer.ty === 2) {
          // 启动内存队列
          const firstWH = getFirstWHSize(layer);
          startRAM.push(firstWH.w * firstWH.h);

          // 最大内存队列
          const maxWH = getMaxWHSize(layer);
          maxRAM.push(maxWH.w * maxWH.h);

          // 运行时内存消耗队列
          const tempRuntimeRAM = [];
          const { w, h } = getAssetsItemFundById(lottieFile, layer.refId);
          const newIp = ip + layer.ip;
          const newOp = op + layer.op;
          for (let i = 0; i < newOp; i++) {
            if (i < newIp) {
              tempRuntimeRAM.push(firstWH.w * firstWH.h);
            } else {
              tempRuntimeRAM.push(w * h);
            }
          }
          runtimeRAM.push(tempRuntimeRAM);
        }
        // 合成会走递归
        if (layer.ty === 0) {
          const preComp = getAssetsItemFundById(lottieFile, layer.refId);
          const newIp = layer.ip + layer.st + ip;
          const newOp = layer.ip + layer.st + op;
          roopLayers(preComp, newIp, newOp);
        }
      })
    }
    roopLayers(lottieFile, 0, 0);
    return lottieFile;
  }

  getResult() {
    return {
      json: this.json,
      reports: this.reports,
    };
  }
}
