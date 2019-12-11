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

### lint 规则

1. 兼容性：详情参考 [lottie Supported Features](https://www.yuque.com/lottie/document/supported-features)
2. 无效图层：当前图层进场时间大于动画结束时间，建议删除图层
3. 不建议使用遮罩层（`Mattes`）：当前图层存在遮罩层，建议使用蒙版替代
4. ae 插件版本识别；5.5.0+ 的判断建议
5. 字体数据检测

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

### rules

| 规则名 | 属性 | 说明 |
| ---- | ---- | ---- |
| incompatible_gradient_strokes | 渐变描边兼容性 |  |
| warn_gradient_warn | 异常渐变 |  |
| incompatible_layer_effects | 效果滤镜 |  |
| incompatible_mask_mode | 蒙版的兼容性 |  |
| info_mask_mode | 蒙版 |  |
| incompatible_auto_orient | 自动定向 |  |
| warn_matte_not_suggested | 遮罩层 |  |
| incompatible_time_remap | 时间重映射 |  |
| info_layertype_shape | 形状的性能优化 |  |
| warn_fonts_json | 字体兼容性 |  |
| warn_old_json_format | 插件版本5.5.0+兼容性 |  |
| warn_layertype_solid | 纯色模块 |  |
| error_invalid_layer | 无效图层 |  |

附：规则详细说明 https://www.yuque.com/lottie/lint

### TODO

- [ ] 更好的lint位置提示 
- [ ] lint 添加 Expressions 的警告
