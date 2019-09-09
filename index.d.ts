declare module 'lottie-lint' {
  // 坐标系可以表达任意位置的element
  interface element {
    // -1～∞，其中-1代表lottie，0～∞代表lottie.assets[asset]
    asset: number;
    // 非必填属性 undefined || 0～∞，代表asset.layers[layer]
    layer?: number;
    // 非必填属性 undefined || 0～∞，代表layer.shapes[shape]
    shape?: number;
    // 非必填属性 undefined || 0～∞，代表shape.gr.it[groupIt]
    groupIt?: number;
    // 非必填属性 undefined || 0～∞，代layer.masksProperties[mask]
    mask?: number;
    // 非必填属性 undefined || 类型，用于辅助快速定位，在结构化以后会帮忙导出
    type?: string;
    // 非必填属性 undefined || 类型，type的辅助属性
    ty?: string;
  }

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

  export class LottieLint {
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
