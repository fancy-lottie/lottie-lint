### lottie lint

### use

```js
const lint = require('lottie-lint');
const { json, report } = lint(lottie json);
```

### lint 规则

1. 无效图层：当前图层进场时间大于动画结束时间，建议删除图层
2. 不建议使用遮罩层（`Mattes`）：当前图层存在遮罩层，建议使用蒙版替代
3. 兼容性：详情参考 [lottie Supported Features](https://github.com/airbnb/lottie/blob/master/supported-features.md)

### 等级

- error: 错误，渲染错误，务必处理
- warn: 警告，建议优化
- info: 提示，通常存在优化空间
- incompatible: 兼容性问题

### report 对象

```ts
// 的坐标系表示出来
interface report {
  message: String; // 提示的文本内容
  type: String; // 类型，枚举: 'error', 'warn', 'info', 'incompatible'
  incompatible: Array; // ['iOS', 'Web', 'Android']
  rule: String; // 规则名称
  name: String; // 层命名
  element: Element; // 当前对象的坐标系
}
```

附: 坐标系的表达: https://www.yuque.com/lottie/xdrbsp/zg967e

### TODO

- [ ] 更好的lint位置提示 
- [ ] lint 添加 Expressions 的警告
