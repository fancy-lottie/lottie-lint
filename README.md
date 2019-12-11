## lottie lint ![travis ci](https://travis-ci.com/Lottie-Lint/lottie-lint.svg?branch=master)

### use

```js
// es module
import linter from 'lottie-lint';
const { json, reports } = linter(lottie json);

// node.js
const linter = require('lottie-lint');
const { json, reports } = linter.default(lottie json);
```

### lint rules

| 规则名 | 属性 | 等级 | 说明 |
| ---- | ---- | ---- | ---- |
| info_mask_mode | 蒙版 | info | |
| info_layertype_shape | 形状的性能优化 | info | |
| incompatible_gradient_strokes | 渐变描边兼容性 | incompatible | [lottie Supported Features](https://www.yuque.com/lottie/document/supported-features) |
| incompatible_layer_effects | 效果滤镜 | incompatible | [lottie Supported Features](https://www.yuque.com/lottie/document/supported-features) |
| incompatible_mask_mode | 蒙版的兼容性 | incompatible | [lottie Supported Features](https://www.yuque.com/lottie/document/supported-features) |
| incompatible_auto_orient | 自动定向 | incompatible | [lottie Supported Features](https://www.yuque.com/lottie/document/supported-features) |
| incompatible_time_remap | 时间重映射 | incompatible | [lottie Supported Features](https://www.yuque.com/lottie/document/supported-features) |
| warn_gradient_warn | 异常渐变 | warn | |
| warn_fonts_json | 字体兼容性 | warn | 字体数据检测 |
| warn_old_json_format | 插件版本5.5.0+兼容性 | warn | ae 插件版本识别；5.5.0+ 的判断建议 |
| warn_layertype_solid | 纯色模块 | warn | |
| warn_matte_not_suggested | 遮罩层 | error | 当前图层存在遮罩层，建议使用蒙版替代 |
| error_invalid_layer | 无效图层 | error | 当前图层进场时间大于动画结束时间，建议删除图层 |

附：规则详细说明 https://www.yuque.com/lottie/lint

### 等级

- error: 错误，渲染错误，务必处理
- warn: 警告，建议优化
- info: 提示，通常存在优化空间
- incompatible: 兼容性问题

### report 对象

```ts
// 的坐标系表示出来
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
// more see `index.d.ts`
```

附: 坐标系的表达: https://www.yuque.com/lottie/xdrbsp/zg967e

### TODO

- [ ] 更好的lint位置提示 
- [ ] lint 添加 Expressions 的警告
