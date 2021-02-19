
const assert = require('assert');

import linter from '../src';

describe('fonts linter', function() {
  it('无字体', () => {
    const lottieData = require('./case_data/compatibility.json');
    const reports = linter(lottieData).reports;
    assert.deepStrictEqual(reports, [
      {
        element: {
          asset: 4,
          layer: 1,
        },
        incompatible: [ 'iOS' ],
        message: '5.6.10以后版本缺省缩放属性导致ios可能无法播放',
        name: 'LINE Copy备份 2.png',
        rule: 'incompatible_keyframes_size_undefined',
        type: 'incompatible',
      },
    ]);
  });
  it('包含字体', () => {
    const lottieData = require('./case_data/image-text.json');
    const reports = linter(lottieData).reports;
    assert.deepStrictEqual(reports, [
      {
        message: '包含字体数据, android 播放器会闪退',
        rule: 'warn_fonts_json',
        element: { asset: -1 },
        type: 'warn',
        name: '风险',
        incompatible: [ 'Android' ],
      },
    ]);
  });
});
