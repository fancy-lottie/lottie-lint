/**
 * 只有客户端可以跑的规则
 * - 图片尺寸倍化的情况 & 自动优化的方法
 * - 图片空白面积溢出的情况 & 自动优化的方法
 * @水映天辙
 */

export default class LottieLintChrome {
  constructor(jsonData) {
    this.json = JSON.parse(JSON.stringify(jsonData));
    this.reports = [];
    this.init();
  }

  init() {
    // 初始化处理;
  }

  getResult(config) {
    // 配置文件的处理
    this.config = config;
    return {
      json: this.json,
      reports: this.reports,
    };
  }
}
