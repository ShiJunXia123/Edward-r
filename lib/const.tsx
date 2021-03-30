import React from "react";

export type SizeObj = {
  width: number;
  height: number;
  borderRadius?: string | number;
};

export interface PictureCropperProps {
  action?: string;
  infoText?: string | React.ReactNode;
  cropBoxSize?: SizeObj; // 初始展示图片的size
  croppedBoxSize?: SizeObj; // 截取图片的size
  clipDivSize?: SizeObj; // 截取图片的size
  saveFileUrl?: (value: any) => void; // 改变教师信息
  limitSize?: number; // 限制图片大小
  preLookBoxSize?: SizeObj; // 限制图片大小
  fixedCropWidth?: number; // 是否截取固定大小图片，截取像素
  fixedCropHeight?: number; // 是否截取固定大小图片，截取像素
  saveBtnInfo?: string; // 保存按钮的文案
  defaultImg?: string;
  proportion?: number; // 长/宽
}

export type NewCropSize = {
  cropHeight: number;
  cropTop: number;
  cropWidth: number;
  cropLeft: number;
};

export const ONEZORE = 1024;
