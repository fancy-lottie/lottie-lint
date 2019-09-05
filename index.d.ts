declare module 'lottie-lint' {
  interface element {}

  interface report {
    // 提示的文本内容
    message: string;
    // 类型，枚举: 'error', 'warn', 'info', 'incompatible'
    type: string;
    // ['iOS', 'Web', 'Android']
    incompatible: string[];
    // 规则名称
    rule: string;
    // 层命名
    name: string;
    // 当前对象的坐标系
    element: element;
    // 当前对象父级节点的坐标系
    parentElement: element;
  }

  interface LottieLintResult {
    json: any,
    reports: report[],
  }

  class LottieLint {
    private json: any;
    private reports: report[];

    constructor(jsonData: any);

    private init;

    /**
     * 对形状类型的遍历
     * @param {any[]} shapes 形状对象
     * @param {element} parentElement 父节点
     * @param {boolean} isGroup 是否是“编组”
     */
    checkShapes(shapes: any[], parentElement: element, isGroup: boolean): void;

    checkAssets(): void;

    checkVersion(): void;

    checkFonts(): void;

    checkLayers(layers: any[], parentElement: any): void;

    checkOldFormat(): void;

    getResult(): LottieLintResult;
  }

  export default function lottieLint(json: any): LottieLintResult
}
