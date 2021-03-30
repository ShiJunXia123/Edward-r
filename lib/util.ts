/**
 *@description 类型均定义在./const文件中
 */

import { NewCropSize } from './const';

export const setAttr = (obj, option, value) => {
  const object = obj;

  switch (option) {
    case 'width':
      object.style.width = value;
      break;
    case 'height':
      object.style.height = value;
      break;
    case 'top':
      object.style.top = value;
      break;
    case 'left':
      object.style.left = value;
      break;
    case 'position':
      object.style.position = value;
      break;
    case 'cursor':
      object.style.cursor = value;
      break;
    default:
      break;
  }
};

/*  Css获取兼容IE  */
export const getAttr = (o, key) =>
  o.currentStyle ? o.currentStyle[key] : document.defaultView.getComputedStyle(o)[key];

/**
 * @param newCropSize:NewCropSize
 * @returns NewCropSize
 *  * */
// 判断是否到达边界
export const judgeBundle = (
  newCropSize: NewCropSize,
  clipBoxArea,
  clipBoxWrapper,
  proportion = 1
) => {
  // 包裹裁剪区的box
  const cropWrapper = clipBoxWrapper;
  const newCropSizeCopy = newCropSize;
  // 一旦超过，找到最小宽高和对应位置
  const minHeight = Math.min(
    newCropSizeCopy.cropHeight,
    parseInt(getAttr(clipBoxArea, 'height')),
    parseInt(getAttr(cropWrapper, 'height')) - parseInt(getAttr(clipBoxArea, 'top'))
  );

  const minWidth = Math.min(
    newCropSizeCopy.cropWidth,
    parseInt(getAttr(clipBoxArea, 'width')),
    parseInt(getAttr(cropWrapper, 'width')) - parseInt(getAttr(clipBoxArea, 'left'))
  );

  const maxTop = Math.max(0, newCropSizeCopy.cropTop, parseInt(getAttr(clipBoxArea, 'top')));

  const minTop = Math.min(
    newCropSizeCopy.cropTop,
    parseInt(getAttr(clipBoxArea, 'top')),
    parseInt(getAttr(clipBoxWrapper, 'height')) - parseInt(getAttr(clipBoxArea, 'height'))
  );

  const maxLeft = Math.max(0, newCropSizeCopy.cropLeft, parseInt(getAttr(clipBoxArea, 'left')));

  const minLeft = Math.min(
    newCropSizeCopy.cropLeft,
    parseInt(getAttr(clipBoxArea, 'left')),
    parseInt(getAttr(clipBoxWrapper, 'width')) - parseInt(getAttr(clipBoxArea, 'width'))
  );

  // 向上拉到边界
  if (parseInt(getAttr(clipBoxArea, 'top')) <= 0) {
    newCropSizeCopy.cropTop = maxTop;

    // 高度等于父框
    if (parseInt(getAttr(clipBoxArea, 'height')) >= parseInt(getAttr(cropWrapper, 'height'))) {
      newCropSizeCopy.cropTop = 0;
      newCropSizeCopy.cropHeight = minHeight;
      newCropSizeCopy.cropWidth = newCropSizeCopy.cropHeight * proportion;
      if (parseInt(getAttr(clipBoxArea, 'left')) <= 0) {
        newCropSizeCopy.cropLeft = maxLeft;
      }

      if (
        parseInt(getAttr(cropWrapper, 'width')) <=
        parseInt(getAttr(clipBoxArea, 'width')) + parseInt(getAttr(clipBoxArea, 'left'))
      ) {
        // 向右拉到边界
        newCropSizeCopy.cropLeft = minLeft;
      }
      return newCropSizeCopy;
    }
  }

  if (
    parseInt(getAttr(cropWrapper, 'height')) <=
    parseInt(getAttr(clipBoxArea, 'top')) + parseInt(getAttr(clipBoxArea, 'height'))
  ) {
    // 向下拉到边界

    newCropSizeCopy.cropTop = minTop || 0;
  }

  // 向左拉到边界
  if (parseInt(getAttr(clipBoxArea, 'left')) <= 0) {
    newCropSizeCopy.cropLeft = maxLeft;

    // 宽度等于父框
    if (parseInt(getAttr(clipBoxArea, 'width')) >= parseInt(getAttr(cropWrapper, 'width'))) {
      newCropSizeCopy.cropLeft = 0;
      newCropSizeCopy.cropWidth = minWidth;

      newCropSizeCopy.cropHeight = newCropSizeCopy.cropWidth / proportion;

      return newCropSizeCopy;
    }
  }

  if (
    parseInt(getAttr(cropWrapper, 'width')) <=
    parseInt(getAttr(clipBoxArea, 'width')) + parseInt(getAttr(clipBoxArea, 'left'))
  ) {
    // 向右拉到边界
    newCropSizeCopy.cropLeft = minLeft;
  }

  return newCropSizeCopy;
};

// 鼠标根据不同方向拉伸距离获取
export const setNewSize = (toEvent, cursor, clipBoxAttr, mouse, proportion = 1) => {
  let newCropSize;
  // 参照 NewCropSize类型
  // 由于是等比缩放，所以要取移动的最大值
  // const min =
  //   Math.abs(mouse.mouseToX) > Math.abs(mouse.mouseToY) ? mouse.mouseToX : mouse.mouseToY
  // const max =
  //   Math.abs(mouse.mouseToX) > Math.abs(mouse.mouseToY) ? mouse.mouseToY : mouse.mouseToX

  switch (cursor) {
    case 'nw-resize': // 左上
      newCropSize = {
        ...newCropSize,
        cropWidth: parseInt(clipBoxAttr.width) - mouse.mouseToX,
        cropHeight: (parseInt(clipBoxAttr.width) - mouse.mouseToX) / proportion, // parseInt(clipBoxAttr.height) - mouse.mouseToY,
        cropLeft: parseInt(clipBoxAttr.left) + mouse.mouseToX,
        cropTop: parseInt(clipBoxAttr.top) + mouse.mouseToX / proportion, // parseInt(clipBoxAttr.top) + mouse.mouseToY
      };
      break;

    case 'ne-resize': // 右上
      // 此时width不能减去鼠标移动距离 因为此时移动距离为正值
      newCropSize = {
        ...newCropSize,
        cropWidth: parseInt(clipBoxAttr.width) + mouse.mouseToX,
        cropHeight: (parseInt(clipBoxAttr.width) + mouse.mouseToX) / proportion, // arseInt(clipBoxAttr.height) - mouse.mouseToY
        // 右上角移动不需要left值 因为默认响右移动
        cropTop: parseInt(clipBoxAttr.top) - mouse.mouseToX / proportion, // parseInt(clipBoxAttr.top) + mouse.mouseToY
        cropLeft: parseInt(clipBoxAttr.left),
      };
      break;

    case 'sw-resize': // 左下
      // 同右上  height 必须是加上鼠标移动距离
      newCropSize = {
        ...newCropSize,
        cropWidth: parseInt(clipBoxAttr.width) - mouse.mouseToX,
        cropHeight: (parseInt(clipBoxAttr.width) - mouse.mouseToX) / proportion, // parseInt(clipBoxAttr.height) + mouse.mouseToY
        cropLeft: parseInt(clipBoxAttr.left) + mouse.mouseToX,
        cropTop: parseInt(clipBoxAttr.top),
      };
      break;

    case 'se-resize': // 右下
      // 左下与右上的结合 同时去除left与top
      newCropSize = {
        ...newCropSize,
        cropWidth: parseInt(clipBoxAttr.width) + mouse.mouseToX,
        cropHeight: (parseInt(clipBoxAttr.width) + mouse.mouseToX) / proportion, // parseInt(clipBoxAttr.height) + mouse.mouseToY
        cropLeft: parseInt(clipBoxAttr.left),
        cropTop: parseInt(clipBoxAttr.top),
      };
      break;

    case 'n-resize': // 上
      newCropSize = {
        ...newCropSize,
        cropHeight: parseInt(clipBoxAttr.height) - mouse.mouseToY,
        cropWidth: (parseInt(clipBoxAttr.height) - mouse.mouseToY) * proportion, // 此行之前没有
        cropTop: parseInt(clipBoxAttr.top) + mouse.mouseToY,
        cropLeft: parseInt(clipBoxAttr.left),
      };
      break;

    case 'w-resize': // 左
      newCropSize = {
        ...newCropSize,
        cropWidth: parseInt(clipBoxAttr.width) - mouse.mouseToX,
        cropLeft: parseInt(clipBoxAttr.left) + mouse.mouseToX,
        cropHeight: (parseInt(clipBoxAttr.width) - mouse.mouseToX) / proportion, // 此行之前没有
        cropTop: parseInt(clipBoxAttr.top),
      };
      break;

    case 's-resize': // 下
      newCropSize = {
        ...newCropSize,
        cropHeight: parseInt(clipBoxAttr.height) + mouse.mouseToY,
        cropWidth: (parseInt(clipBoxAttr.height) + mouse.mouseToY) * proportion, // 此行之前没有
        cropLeft: parseInt(clipBoxAttr.left),
        cropTop: parseInt(clipBoxAttr.top),
      };
      break;

    case 'e-resize': // 右
      newCropSize = {
        ...newCropSize,
        cropWidth: parseInt(clipBoxAttr.width) + mouse.mouseToX,
        cropHeight: (parseInt(clipBoxAttr.width) + mouse.mouseToX) / proportion,
        cropLeft: parseInt(clipBoxAttr.left),
        cropTop: parseInt(clipBoxAttr.top),
        // 此行之前没有
      };
      break;

    case 'move':
      newCropSize = {
        ...newCropSize,
        cropTop: parseInt(clipBoxAttr.top) + mouse.mouseToY,
        cropLeft: parseInt(clipBoxAttr.left) + mouse.mouseToX,
        cropWidth: parseInt(clipBoxAttr.width),
        cropHeight: parseInt(clipBoxAttr.height),
      };
      // handleCropperMove(toEvent, mouse)
      break;

    default:
      break;
  }

  return newCropSize;
};
