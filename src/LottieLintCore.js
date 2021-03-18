/**
 * 除了基础规则以外的指标约束
 * @水映天辙
 */

export default class LottieLintPro {
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
