// const assert = require('assert');

import other from '../src/core/other';

describe('core-other', function() {
  it.only('检测other的内存', () => {
    const lottieData = require('./case_data/1_4.json');
    const Other = new other(lottieData);
    const reports = Other.countRAM();
    console.log(JSON.stringify(reports, null, 2));
  });
});
