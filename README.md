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

### TODO

- [ ] 更好的lint位置提示 
- [ ] lint 添加 Expressions 的警告
