/**
 * 重置图片的尺寸，AE在使用过程中会存在用户使用大图的情况，要杜绝该情况的发生
 * TODO:
 *  - 对骨骼结构存在parent和children之间关系的元素要做关联属性变更
 *  - 要对图片缩小的熵化效果负责，要设计好回归算法
 * @weiesky
 */
import Pica from 'pica/dist/pica.js';
import util from '../util';

const pica = Pica();

// Threshold: 阈值的度量 TODO: Threshold的度量暂时不做深度思考，父子继承关系
function hasOverflowImage(lottieFile, Threshold = 95) {
  const newLottieFile = JSON.parse(JSON.stringify(lottieFile));
  const hasImage = [];
  const images = [];
  if (!newLottieFile) {
    return false;
  }
  newLottieFile.assets.forEach(item => {
    // 选出图片图层
    if (item.id && item.p && item.p.length) {
      images.push({
        ...item,
        maxSize: getItemsMaxSize(item, newLottieFile),
      });
    }
  });
  // 确认遍历的图片图层不作为其他图层的父节点，父亲节点的图层不做缩放
  newLottieFile.layers.forEach(layer => {
    images.forEach((image, index) => {
      if (layer.refId === image.id) {
        const children = util.getLayerChildren(newLottieFile.layers, layer);
        if (children.length) {
          images.splice(index, 1);
        }
      }
    });
  });
  newLottieFile.assets.forEach(asset => {
    asset?.layers?.forEach(layer => {
      images.forEach((image, index) => {
        if (layer.refId === image.id) {
          const children = util.getLayerChildren(asset.layers, layer);
          if (children.length) {
            images.splice(index, 1);
          }
        }
      });
    });
  });

  images.forEach(item => {
    // 选出图片图层
    if (item.id && item.p && item.p.length) {
      const maxSize = getItemsMaxSize(item, newLottieFile);
      if (maxSize < Threshold) {
        const nm = util.getAssetItemName(newLottieFile, item.id)
        hasImage.push({
          message: `${nm} 图片实际使用尺寸为原图的${maxSize}%，建议优化`,
          rule: 'info_image_oversize',
          element: { asset: -1 },
          type: 'info',
          name: `图片资源-${nm}`,
        });
      }
    }
  });
  return hasImage.length ? hasImage : null;
}

// 重置图片的尺寸
function resetImage(id, lottieFile, maxSize) {
  let item;
  lottieFile.assets.forEach(it => {
    if (it.id === id) {
      item = it;
    }
  });
  if (!item || item.p.indexOf('http') === 0) {
    return new Promise(resolve => {
      resolve({ ...item });
    });
  }
  const canvas = document.createElement('canvas'); // 准备canvas环境
  canvas.width = item.w;
  canvas.height = item.h;
  const ctx = canvas.getContext('2d');
  const image = new Image();
  image.src = item.p;

  const w = Math.round((item.w * maxSize) / 100);
  const h = Math.round((item.h * maxSize) / 100);
  const newCanvas = document.createElement('canvas'); // 准备canvas环境
  newCanvas.width = w;
  newCanvas.height = h;
  return new Promise(resolve => {
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
      pica
        .resize(canvas, newCanvas, {
          alpha: true,
        })
        .then(() => {
          resolve({
            ...item,
            w,
            h,
            p: newCanvas.toDataURL('image/png'),
          });
        });
    };
  });
}

// 遍历图片图层的关键帧和属性，获取当前图层的极大值
function getMaxSize(item) {
  let w = 0;
  let h = 0;
  // TODO: 图片只是初始化属性的设置
  const itemSK = item.ks && item.ks.s && item.ks.s.k && item.ks.s.k;
  if (itemSK && itemSK.length) {
    if (typeof itemSK[0] === 'number') {
      return Math.max(Math.abs(itemSK[0]), Math.abs(itemSK[1]));
    }
    item.ks.s.k.forEach(it => {
      if (it.s && it.s[0] !== undefined) {
        w = Math.max(Math.abs(it.s && it.s[0]), Math.abs(it.e && it.e[0]), w);
        h = Math.max(Math.abs(it.s && it.s[1]), Math.abs(it.e && it.e[1]), h);
      }
    });
  }
  return Math.max(w, h);
}

// 递归辅助函数
function getItemsMaxSize(item, lottieFile) {
  let MaxSize = 0;

  // 原始图片尺寸在30 x 30以下将图片不再做优化
  const MIN_IMAGE_SIZE = 30 * 30;
  if (item.w * item.h < MIN_IMAGE_SIZE) {
    return 100;
  }

  // root 主合成遍历
  lottieFile.layers.forEach(it => {
    if (it.refId === item.id) {
      MaxSize = getMaxSize(it);
    }
  });

  // assets 子合成遍历
  lottieFile.assets.forEach(asset => {
    if (asset && asset.layers) {
      asset.layers.forEach(it => {
        if (it.refId === item.id) {
          MaxSize = getMaxSize(it);
        }
      });
    }
  });
  return MaxSize || 100;
}

// 重置宽高的尺寸
function resizeSK(it, { maxW, maxH }) {
  return [
    Number(((it[0] * 100) / maxW).toFixed(2)),
    Number(((it[1] * 100) / maxH).toFixed(2)),
    it[2], // 3D先固定不管
  ];
}

// 重置轴心的坐标位置
function resizeAK(it, { maxW, maxH }) {
  return [
    Number(((it[0] * maxW) / 100).toFixed(2)),
    Number(((it[1] * maxH) / 100).toFixed(2)),
    it[2], // 3D先固定不管
  ];
}

// 重新给item更新尺寸大小 (param: item, maxSize)
function setItemSize(item, maxSize, image, reverse) {
  const option = {
    maxW: (Math.round(image.w * maxSize) / (image.w * maxSize)) * maxSize,
    maxH: (Math.round(image.h * maxSize) / (image.h * maxSize)) * maxSize,
  };
  if (reverse) {
    option.maxW = Math.round(image.w * maxSize) / (image.w * maxSize) / maxSize;
    option.maxH = Math.round(image.w * maxSize) / (image.w * maxSize) / maxSize;
  }
  // 图片存在关键帧
  const itemSK = item.ks && item.ks.s && item.ks.s.k;
  if (itemSK && itemSK.length) {
    if (typeof itemSK[0] === 'number') {
      item.ks.s.k = resizeSK(itemSK, option);
    } else {
      item.ks.s.k.forEach(it => {
        if (it.s && it.s[0] !== undefined) {
          it.s = resizeSK(it.s, option);
        }
        if (it.e && it.e[0] !== undefined) {
          it.e = resizeSK(it.e, option);
        }
      });
    }
  }
  // 重置图片的轴心位置
  const itemAK = item.ks && item.ks.a && item.ks.a.k;
  if (itemAK && itemAK.length) {
    if (typeof itemAK[0] === 'number') {
      item.ks.a.k = resizeAK(itemAK, option);
    } else {
      item.ks.a.k.forEach(it => {
        if (it.s && it.s[0] !== undefined) {
          it.s = resizeAK(it.s, option);
        }
        if (it.e && it.e[0] !== undefined) {
          it.e = resizeAK(it.e, option);
        }
      });
    }
  }
  return item;
}

// 递归辅助函数(重新更新所有图片图层的尺寸)
function resetItems(id, lottieFile, maxSize) {
  let image;
  lottieFile.assets.forEach(asset => {
    if (asset.id === id) {
      image = asset;
    }
  });
  // root
  lottieFile.layers.forEach(item => {
    if (item.refId === id) {
      item = setItemSize(item, maxSize, image);
    }
  });
  // assets
  lottieFile.assets.forEach(asset => {
    if (asset && asset.layers) {
      asset.layers.forEach(item => {
        if (item.refId === id) {
          item = setItemSize(item, maxSize, image);
        }
      });
    }
  });
  return lottieFile;
}

// lottie的图片尺寸压缩的优化
async function resetImageSize(lottieFile, Threshold = 95) {
  let newLottieFile = JSON.parse(JSON.stringify(lottieFile));
  const images = [];
  if (!newLottieFile) {
    return false;
  }
  newLottieFile.assets.forEach(item => {
    // 选出图片图层
    if (item.id && item.p && item.p.length) {
      images.push({
        id: item.id,
        maxSize: getItemsMaxSize(item, newLottieFile),
      });
    }
  });

  // 确认遍历的图片图层不作为其他图层的父节点，父亲节点的图层不做缩放
  newLottieFile.layers.forEach(layer => {
    images.forEach((image, index) => {
      if (layer.refId === image.id) {
        const children = util.getLayerChildren(newLottieFile.layers, layer);
        if (children.length) {
          images.splice(index, 1);
        }
      }
    });
  });
  newLottieFile.assets?.forEach(asset => {
    asset?.layers?.forEach(layer => {
      images.forEach((image, index) => {
        if (layer.refId === image.id) {
          const children = util.getLayerChildren(asset.layers, layer);
          if (children.length) {
            images.splice(index, 1);
          }
        }
      });
    });
  });

  // 置换属性
  images.forEach(image => {
    if (image.maxSize < Threshold) {
      newLottieFile = resetItems(image.id, newLottieFile, image.maxSize);
    }
  });
  // 置换图片
  const newImages = await images.map(async image => {
    if (image.maxSize < Threshold) {
      const item = await resetImage(image.id, newLottieFile, image.maxSize);
      return item;
    }
  });
  const results = await Promise.all(newImages);
  newLottieFile.assets = newLottieFile.assets.map(item => {
    let newItem = item;
    results.forEach(image => {
      if (image && item.id === image.id) {
        newItem = image;
      }
    });
    return newItem;
  });

  return newLottieFile;
}

export {
  resetImageSize, // 具体图片优化的方法
  hasOverflowImage, // 判断是不是存在图片可以缩小
};
