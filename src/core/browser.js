// eslint-disable-next-line jsdoc/implements-on-classes
/**
 * 只有客户端可以跑的规则
 * - 图片尺寸倍化的情况 & 自动优化的方法
 * - 图片空白面积溢出的情况 & 自动优化的方法
 * @水映天辙
 */

import resetImageBlank from '../utils/resetImageBlank';
import resetImageSize from '../utils/resetImageSize';

export default class LottieLintBrowser {
    constructor(jsonData) {
        this.json = JSON.parse(JSON.stringify(jsonData));
        this.reports = [];
        this.init();
    }

    init() {
        const lottieFile = this.json;


        // 初始化处理;
        if (window && window.document) {
            const hasImageBlank = resetImageBlank.hasImageBlankForLint(lottieFile);
            const hasOverflowImage = resetImageSize.hasOverflowImage(lottieFile);

            if (hasImageBlank) {
                this.reports = hasImageBlank;
            }
            if (hasOverflowImage) {
                this.reports = this.reports.concat(hasOverflowImage);
            }
        }
    }

    getResult() {

        // 配置文件的处理
        return {
            json: this.json,
            reports: this.reports
        };
    }
}
