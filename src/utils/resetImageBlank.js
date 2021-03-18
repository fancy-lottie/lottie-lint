/**
 * 图片通常在AE中使用存在大面积边缘透明区域，这个区域参与终端渲染计算导致不必要的运行性能浪费
 * TODO:
 *  - 对骨骼结构存在parent和children之间关系的元素要做关联属性变更
 * @weiesky
 */
import util from '../util';

// 判断是否存在图片有无意义的空白区域 for循环跳出 给lint使用的版本
async function hasImageBlankForLint(lottieFile, params = {}) {
  const newLottieFile = JSON.parse(JSON.stringify(lottieFile));
  const images = [];
  if (!newLottieFile) {
    return false;
  }
  newLottieFile.assets.forEach(item => {
    const { p, id, w, h } = item;
    // 选出图片图层
    if (id && p && p.length && p.indexOf('http') !== 0) {
      images.push({
        p,
        w,
        h,
        id,
      });
    }
  });

  // 测绘出图片空白区域
  const Promises = images.map(async item => {
    return getImageBlankArea(item, params);
  });
  let resultImages = await Promise.all(Promises);

  // 清洗不必要优化的图片
  resultImages = resultImages.filter(it => it);

  // 存在蒙板的图片无法参与优化，这里不做过滤，但会打标提醒
  resultImages = hasMask(resultImages, newLottieFile);

  const result = [];
  resultImages.forEach(img => {
    const { originWidth, originHeight, w, h } = img;
    if (originWidth - w > 0 || originHeight - h > 0) {
      const nm = util.getAssetItemName(newLottieFile, img.id);
      const message = `“${nm}”, 裁剪区域面积为 ${Math.floor(
        Number(originWidth * originHeight - w * h)
      )} 像素 ( 节省${Number(100 - ((w * h) / (originWidth * originHeight)) * 100).toFixed(1)}% )`;
      let report = {
        message,
        rule: 'info_image_has_blank',
        element: { asset: -1 },
        type: 'info',
        name: `图片资源-${nm}`,
      };
      if (img.hasMask) {
        report = {
          message,
          rule: 'warn_image_has_blank_width_mask',
          element: { asset: -1 },
          type: 'warn',
          name: `图片资源-${nm}`,
        };
      }
      result.push(report);
    }
  });
  return result.length > 0 ? result : null;
}

// 判断是否存在图片有无意义的空白区域 for循环跳出
async function hasImageBlank(lottieFile, params = {}) {
  const newLottieFile = JSON.parse(JSON.stringify(lottieFile));
  const images = [];
  if (!newLottieFile) {
    return false;
  }
  newLottieFile.assets.forEach(item => {
    const { p, id, w, h } = item;
    // 选出图片图层
    if (id && p && p.length && p.indexOf('http') !== 0) {
      images.push({
        p,
        w,
        h,
        id,
      });
    }
  });

  // 测绘出图片空白区域
  const Promises = images.map(async item => {
    return getImageBlankArea(item, params);
  });
  let resultImages = await Promise.all(Promises);

  // 清洗不必要优化的图片
  resultImages = resultImages.filter(it => it);

  // 存在蒙板的图片无法参与优化，这里不做过滤，但会打标提醒
  resultImages = hasMask(resultImages, newLottieFile);

  const result = [];
  resultImages.forEach(img => {
    const { originWidth, originHeight, w, h } = img;
    if (originWidth - w > 0 || originHeight - h > 0) {
      result.push({
        ...img,
        nm: util.getAssetItemName(newLottieFile, img.id),
        diff: Math.floor(Number(originWidth * originHeight - w * h)),
        size: Number(100 - ((w * h) / (originWidth * originHeight)) * 100).toFixed(1),
      });
    }
  });
  return result.length > 0 ? result : null;
}

function hasMask(resultImages, newLottieFile) {
  resultImages.forEach(image => {
    newLottieFile.layers.forEach(layer => {
      if (layer.refId === image.id) {
        if (layer.hasMask) {
          image.hasMask = true;
        }
      }
    });
    newLottieFile.assets.forEach(asset => {
      asset?.layers?.forEach(layer => {
        if (layer.refId === image.id) {
          if (layer.hasMask) {
            image.hasMask = true;
          }
        }
      });
    });
  });
  return resultImages;
}

// 重置图片的尺寸
function resetImage(itemOption) {
  const { imageItem, left, top, originWidth, originHeight, w, h } = itemOption;
  // 如果图片大小一致，则不需要优化
  if (originWidth * originHeight <= w * h) {
    return new Promise(resolve => {
      resolve(itemOption);
    });
  }

  const newCanvasElement = document.createElement('canvas'); // 准备canvas环境
  newCanvasElement.width = w;
  newCanvasElement.height = h;
  const ctx = newCanvasElement.getContext('2d');
  const image = new Image();
  image.src = imageItem.p;
  return new Promise(resolve => {
    image.onload = () => {
      ctx.drawImage(image, left, top, w, h, 0, 0, w, h);
      resolve({
        ...itemOption,
        p: newCanvasElement.toDataURL(),
      });
    };
  });
  // eslint-disable-next-line no-unreachable
  return ctx;
}

// 重置图层的位移
function resizeSK(it, { left, top, originWidth, originHeight, w, h }, move) {
  if (move) {
    return it;
  }
  const localW = originWidth / 2 - w / 2;
  const localH = originHeight / 2 - h / 2;
  if (it[2] === undefined) {
    return [ Number((it[0] - localW + left).toFixed(2)), Number((it[1] - localH + top).toFixed(2)) ];
  }
  return [
    Number((it[0] - localW + left).toFixed(2)),
    Number((it[1] - localH + top).toFixed(2)),
    it[2], // 3D先固定不管
  ];
}

// 重置图层轴心的坐标位置
function resizeAK(it, { left, top, originWidth, originHeight, w, h }, move) {
  // 如果图片的中轴线没有做过变化的话，则重新定义图层轴心为宽高的1/2;
  if (
    Number(it[0]).toFixed(1) === Number(originWidth / 2).toFixed(1) &&
    Number(it[1]).toFixed(1) === Number(originHeight / 2).toFixed(1) &&
    !move
  ) {
    if (it[2] === undefined) {
      return [[ Number((w / 2).toFixed(2)), Number((h / 2).toFixed(2)) ], false ];
    }
    return [
      [
        Number((w / 2).toFixed(2)),
        Number((h / 2).toFixed(2)),
        it[2], // 3D先固定不管
      ],
      false,
    ];
  }
  // 如果发生变化，说明旋转需要轴心变化，则需要继承原来图片的轴心坐标
  if (it[2] === undefined) {
    return [[ Number((it[0] - left).toFixed(2)), Number((it[1] - top).toFixed(2)) ], true ];
  }
  return [
    [
      Number((it[0] - left).toFixed(2)),
      Number((it[1] - top).toFixed(2)),
      it[2], // 3D先固定不管
    ],
    true,
  ];
}

// resetImageSize: 重新给item更新尺寸大小 (param: item, resetItem)
function setItemSize(item, imageItem, layers) {
  // * move是核心参数，用来判断移动轴心(true)，还是移动坐标(false) 存在放大缩小或者旋转行为，则重心保持不动
  let move =
    JSON.stringify(item?.ks?.s?.k) !== JSON.stringify([ 100, 100, 100 ]) || item?.ks?.r?.k !== 0;

  // 轴心的偏移量的计算
  const itemAK = item?.ks?.a?.k;
  // 重置图片的轴心位置
  if (itemAK && itemAK.length) {
    if (typeof itemAK[0] === 'number') {
      [ item.ks.a.k, move ] = resizeAK(itemAK, imageItem, move);
    } else {
      // 关键帧类型
      item.ks.a.k.forEach(it => {
        if (it.s && it.s[0] !== undefined) {
          [ it.s, move ] = resizeAK(it.s, imageItem, move);
        }
        if (it.e && it.e[0] !== undefined) {
          [ it.e, move ] = resizeAK(it.e, imageItem, move);
        }
      });
    }
  }

  // 重置图片的位移动
  const itemSK = item?.ks?.p?.k;
  if (itemSK && itemSK.length) {
    if (typeof itemSK[0] === 'number') {
      item.ks.p.k = resizeSK(itemSK, imageItem, move);
    } else {
      // 关键帧类型
      item.ks.p.k.forEach(it => {
        if (it.s && it.s[0] !== undefined) {
          it.s = resizeSK(it.s, imageItem, move);
        }
        if (it.e && it.e[0] !== undefined) {
          it.e = resizeSK(it.e, imageItem, move);
        }
      });
    }
  }

  // 修改子元素的p
  const changeChild = util.getLayerChildren(layers, item);
  if (changeChild.length) {
    const { left, top } = imageItem;
    layers.forEach(it => {
      changeChild.forEach(child => {
        if (child.ind === it.ind) {
          const itAK = it?.ks?.p?.k;
          if (typeof itAK[0] === 'number') {
            if (itAK[2] === undefined) {
              it.ks.p.k = [ Number((itAK[0] - left).toFixed(2)), Number((itAK[1] - top).toFixed(2)) ];
            } else {
              it.ks.p.k = [
                Number((itAK[0] - left).toFixed(2)),
                Number((itAK[1] - top).toFixed(2)),
                itAK[2], // 3D先固定不管
              ];
            }
          } else {
            // 关键帧类型
            itAK.forEach(ak => {
              if (ak.s && ak.s[0] !== undefined) {
                if (ak.s[2] === undefined) {
                  ak.s = [ Number((ak.s[0] - left).toFixed(2)), Number((ak.s[1] - top).toFixed(2)) ];
                } else {
                  ak.s = [
                    Number((ak.s[0] - left).toFixed(2)),
                    Number((ak.s[1] - top).toFixed(2)),
                    ak.s[2], // 3D先固定不管
                  ];
                }
              }
              if (ak.e && ak.e[0] !== undefined) {
                if (ak.e[2] === undefined) {
                  ak.e = [ Number((ak.e[0] - left).toFixed(2)), Number((ak.e[1] - top).toFixed(2)) ];
                } else {
                  ak.e = [
                    Number((ak.e[0] - left).toFixed(2)),
                    Number((ak.e[1] - top).toFixed(2)),
                    ak.e[2], // 3D先固定不管
                  ];
                }
              }
            });
          }
        }
      });
    });
  }

  return item;
}

// 处理单张图片
async function getImageBlankArea(imageItem, { px = 100, percent = 0.95 }) {
  const { w, h } = imageItem;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // 准备图片元素对象
  const img = new Image();
  img.crossOrigin = '';
  img.src = imageItem.p;
  img.width = w;
  img.height = h;

  let lOffset = w;
  let rOffset = 0;
  let tOffset = h;
  let bOffset = 0;

  return new Promise(resolve => {
    // 当图片准备以后再绘制
    img.onload = () => {
      // 绘制图片,按照图片本身的大小进行加载
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h).data;
      for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {
          const pos = (i + w * j) * 4;
          if (
            imgData[pos] > 0 ||
            imgData[pos + 1] > 0 ||
            imgData[pos + 2] ||
            imgData[pos + 3] > 0
          ) {
            // 说第j行第i列的像素不是透明的
            bOffset = Math.max(j, bOffset); // 找到有色彩的最底部的纵坐标
            rOffset = Math.max(i, rOffset); // 找到有色彩的最右端
            tOffset = Math.min(j, tOffset); // 找到有色彩的最上端
            lOffset = Math.min(i, lOffset); // 找到有色彩的最左端
          }
        }
      }
      // 由于循环是从0开始的,而我们认为的行列是从1开始的
      // 意思是说包含有像素的区域是 左边第1行,到右边第100行,顶部第26行,到底部50行
      // 此时如果你想找到外部区域的话,就是 left和top减1  right和bottom加1的区域
      // 分别是0, 101, 25, 51.这个区间能够刚好包裹住
      lOffset++;
      rOffset++;
      tOffset++;
      bOffset++;

      // 如果图片存在空白区域，则需要做裁剪保存
      const hOffset = bOffset - tOffset + 1;
      const wOffset = rOffset - lOffset + 1;
      if (
        Math.floor(Number(imageItem.w * imageItem.h - wOffset * hOffset)) > px && // 优化面积小于多少像素就忽略
        (wOffset * hOffset) / (imageItem.w * imageItem.h) < percent // 优化比例小于多少比例就忽略
      ) {
        return resolve({
          imageItem,
          id: imageItem.id,
          left: lOffset - 1,
          right: rOffset,
          top: tOffset - 1,
          bottom: bOffset,
          originWidth: imageItem.w,
          originHeight: imageItem.h,
          w: wOffset,
          h: hOffset,
        });
      }
      return resolve(null);
    };
  });
}

// lottie的图片尺寸压缩的优化
async function resetImageBlank(lottieFile, params = {}) {
  const newLottieFile = JSON.parse(JSON.stringify(lottieFile));
  const images = [];
  if (!newLottieFile) {
    return false;
  }
  newLottieFile.assets.forEach(item => {
    const { p, id, w, h } = item;
    // 选出图片图层
    if (id && p && p.length && p.indexOf('http') !== 0) {
      images.push({
        p,
        w,
        h,
        id,
      });
    }
  });

  // 测绘出图片空白区域
  let Promises = images.map(async item => {
    return getImageBlankArea(item, params);
  });
  let resultImages = await Promise.all(Promises);

  // 清洗不必要优化的图片
  resultImages = resultImages.filter(it => it);

  // 生成新的图片列表
  Promises = resultImages.map(async item => {
    return resetImage(item);
  });
  resultImages = await Promise.all(Promises);

  // 存在蒙板的图片无法参与优化，会被过滤
  resultImages = hasMask(resultImages, newLottieFile);
  resultImages = resultImages.filter(item => !item.hasMask);

  // 置换图片
  resultImages.forEach(item => {
    newLottieFile.assets.forEach(asset => {
      if (asset.id === item.imageItem.id && item.p) {
        asset.p = item.p;
        asset.w = item.w;
        asset.h = item.h;
      }
    });
  });

  // 对引用图片的地方做一次全局属性修改
  resultImages.forEach(item => {
    newLottieFile.layers.forEach(layer => {
      if (layer.refId === item.id) {
        layer = setItemSize(layer, item, newLottieFile.layers);
      }
    });
    newLottieFile.assets.forEach(asset => {
      asset?.layers?.forEach(layer => {
        if (layer.refId === item.id) {
          layer = setItemSize(layer, item, asset.layers);
        }
      });
    });
  });

  return newLottieFile;
}

export {
  resetImageBlank, // 具体图片优化的方法
  hasImageBlank, // 判断是不是存在图片空白
  hasImageBlankForLint, // 判断是不是存在图片空白 给lottie-lint专用
};
