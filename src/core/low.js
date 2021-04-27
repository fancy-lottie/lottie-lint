/**
 * TODO: lottie-lint高级校验规则的定制
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
