import Standard from "./core/standard";
import Browser from "./core/browser";
import Other from "./core/other";
import Law from "./core/law";

export default {
    // 基础的校验结构
    standard(jsonData) {
        return new Standard(jsonData).getResult();
    },

    // 支持客户端能力的附加检测图片的一些优化选项
    browser(jsonData) {
        const standard = new Standard(jsonData);

        return new Browser(standard.getResult()).getResult();
    },

    // 带检测属性给滤过的标准执行判断
    law(jsonData, config) {
        const browser = this.browser(jsonData);
        const other = new Other(jsonData).getResult();

        return Law.getResult(jsonData, browser, other, config).getResult();
    }
};
