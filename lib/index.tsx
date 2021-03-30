/**
 *@author junxia
 * @file 图片裁剪上传组件canvas
 *
 */

import React, {
  useRef,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { Upload, Button, message } from "antd";
import defaultAvatar from "./img/default-avatar.png";
import "./index.less";
import { NewCropSize, ONEZORE, PictureCropperProps } from "./const";
import { getAttr, judgeBundle, setAttr, setNewSize } from "./util";
import CropHandler from "./CropHandler";

const PictureCropper = (props: PictureCropperProps) => {
  const {
    action,
    infoText,
    cropBoxSize,
    croppedBoxSize,
    clipDivSize,
    saveFileUrl,
    limitSize,
    fixedCropWidth,
    fixedCropHeight,
    saveBtnInfo,
    defaultImg,
    proportion,
  } = props;

  // 图片上传成功链接
  const [imgUrl, setImgUrl]: [any, Dispatch<SetStateAction<any>>] = useState(
    ""
  );

  // canvas绘制对象
  const [ctx, setCtx]: [any, Dispatch<SetStateAction<any>>] = useState();

  // 图片加载到canvas时长宽缩放比例
  const [scale, setScale] = useState({ scaleX: 1, scaleY: 1 });

  const canvasRef = useRef();
  // 图片区域，包裹裁剪区的ref
  const clipBoxWrapper = useRef();
  const clipBox = useRef();
  const previewRef = useRef();

  // 创建img对象
  let img;

  // 上传图片时，创建img，画到canvas中
  const showImgInCanvas = (url: string) => {
    img = new Image();
    img.setAttribute("id", "newImg");
    img.setAttribute("crossOrigin", "Anonymous");
    // 之前用的是上传之后接口返回的超链，处理完画布污染有跨域问题
    img.src = url;
    img.width = cropBoxSize.width;
    img.height = cropBoxSize.height;

    // 图片加载完成后展示到canvas
    img.onload = () => {
      ctx.drawImage(img, 0, 0, cropBoxSize.width, cropBoxSize.height);

      setScale({
        scaleX: cropBoxSize.width / img.naturalWidth,
        scaleY: cropBoxSize.height / img.naturalHeight,
      });
    };

    document.querySelector("#img-box").appendChild(img);
  };

  // 上传前处理避免上传成功后再引用图片跨域
  const beforeUpload = (file) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = (event: any) => {
      showImgInCanvas(event.target.result);
    };

    if (limitSize) {
      if (file.size / ONEZORE / ONEZORE > limitSize) {
        message.error(`图片大小不能超过${limitSize}M`);
        return false;
      }
      return true;
    }

    return true;
  };

  // 上传图片函数
  const handleUpload = ({ file }) => {
    if (file.status === "done") {
      if (file?.response?.data?.upLoadsuccess) {
        setImgUrl(file?.response?.data?.fileUrl);
        return message.info("图片上传成功！");
      }

      return message.error(file?.response?.message);
    }

    if (file.status === "error") {
      return message.error("图片上传失败");
    }

    return null;
  };

  // 删除已上传的图片
  const handleRemove = () => {
    setImgUrl("");
  };

  // 判断合理后最终赋值
  const setCropSize = (newCropSize: NewCropSize, clipBoxArea) => {
    // 获取当前截图框的宽高
    const cropSize = {
      width: parseInt(getAttr(clipBoxArea, "width")),
      height: parseInt(getAttr(clipBoxArea, "height")),
    };

    const previewNew = previewRef.current;

    // 赋值
    if (newCropSize.cropWidth) {
      setAttr(clipBoxArea, "width", `${newCropSize.cropWidth}px`);
      setAttr(
        previewNew,
        "width",
        `${
          (croppedBoxSize.width / newCropSize.cropWidth) * cropBoxSize.width
        }px`
      );
    }

    if (newCropSize.cropHeight) {
      setAttr(clipBoxArea, "height", `${newCropSize.cropHeight}px`);

      setAttr(
        previewNew,
        "height",
        `${
          (croppedBoxSize.height / newCropSize.cropHeight) * cropBoxSize.height
        }px`
      );
    }

    if (newCropSize.cropLeft || newCropSize.cropLeft === 0) {
      setAttr(clipBoxArea, "left", `${newCropSize.cropLeft}px`);

      setAttr(
        previewNew,
        "left",
        `-${(croppedBoxSize.width / cropSize.width) * newCropSize.cropLeft}px`
      );
    }

    if (newCropSize.cropTop || newCropSize.cropTop === 0) {
      setAttr(clipBoxArea, "top", `${newCropSize.cropTop}px`);

      setAttr(
        previewNew,
        "top",
        `-${(croppedBoxSize.height / cropSize.height) * newCropSize.cropTop}px`
      );
    }
  };

  // 鼠标在截取图片div上按下的事件
  const handleMouseDown = (event: MouseEvent | any) => {
    const oEvent = event || window.event;
    const clipBoxArea = clipBox.current as any;

    // 当前裁剪区域位置信息
    const clipBoxAttr = {
      left: getAttr(clipBoxArea, "left"),
      top: getAttr(clipBoxArea, "top"),
      width: getAttr(clipBoxArea, "width"),
      height: getAttr(clipBoxArea, "height"),
    };

    // 判断鼠标位置
    let mouse = {
      mouseX: oEvent.clientX,
      mouseY: oEvent.clientY,
      mouseToX: oEvent.clientX,
      mouseToY: oEvent.clientY,
    };

    //! 一旦鼠标按下，那么cursor的类型就不变了
    const cursor = getAttr(oEvent.target, "cursor");
    document.onmousemove = (ev: MouseEvent | any) => {
      const toEvent = ev || window.event;

      mouse = {
        ...mouse,
        mouseToX: toEvent.clientX - mouse.mouseX,
        mouseToY: toEvent.clientY - mouse.mouseY,
      };

      const newCropSize = setNewSize(
        toEvent,
        cursor,
        clipBoxAttr,
        mouse,
        proportion
      );
      const newCropSizeCopy = judgeBundle(
        newCropSize,
        clipBoxArea,
        clipBoxWrapper.current,
        proportion
      );

      setCropSize(newCropSizeCopy, clipBoxArea);
    };

    document.onmouseup = () => {
      // 移动事件取消
      document.onmousemove = null;

      // 阻止默认事件
      oEvent.preventDefault();
    };

    oEvent.preventDefault();
  };

  // 鼠标抬起
  document.addEventListener("mouseup", (ev) => {
    const oEvent = ev || window.event;
    const clipBoxArea = clipBox.current as any;

    // 移动事件取消
    clipBoxArea && (clipBoxArea.onmousemove = null);

    // 阻止默认事件
    oEvent.preventDefault();
  });

  // 截取图片后，上传
  const croppedImgUpload = (data) => {
    const arr = data.split(",");
    // 拿到类型
    const mime = arr[0].match(/:(.*?);/)[1];
    // 拿到图片类型
    const bstr = atob(arr[1]);
    let { length } = bstr;
    const u8arr = new Uint8Array(length);

    while (length--) {
      u8arr[length] = bstr.charCodeAt(length);
    }

    // 转化文件格式,此处文件名称必须添加文件类型后缀
    const file = new File([u8arr], `photo.${mime.split("/")[1]}`, {
      type: mime,
    });

    const formData = new FormData();
    formData.append("file", file);

    fetch(action, {
      body: formData,
      method: "POST",
    })
      .then((response) => response.json())
      .catch((error) => message.error(error))
      .then((response) => {
        saveFileUrl(response?.data?.fileUrl);
        document.querySelector("#img-box").innerHTML = "";

        return message.info("图片上传成功！");
      });
  };

  // 获取截取图片
  const cropImg = (image) => {
    // canvas转化成图片
    document.querySelector("#upload-img-box").innerHTML = "";
    const newCanvas = document.createElement("canvas");
    newCanvas.width = fixedCropWidth || croppedBoxSize.width;
    newCanvas.height = fixedCropHeight || croppedBoxSize.height;
    document.querySelector("#upload-img-box").appendChild(newCanvas);

    const newCtx = newCanvas.getContext("2d");

    // canvas转化为图片
    const newImage = new Image();
    newImage.setAttribute("crossOrigin", "anonymous");

    newImage.onload = async () => {
      const clip = clipBox.current as any;

      // 根据缩放比例确定截取位置
      (newCtx as any).drawImage(
        image,
        parseFloat(clip.style.left) / scale.scaleX || 0,
        parseFloat(clip.style.top) / scale.scaleY || 0,
        parseInt(clip.style.width) / scale.scaleX,
        parseInt(clip.style.height) / scale.scaleY,
        0,
        0,
        fixedCropWidth || croppedBoxSize.width,
        fixedCropWidth || croppedBoxSize.height
      );

      const data = newCanvas.toDataURL();
      croppedImgUpload(data);
    };

    // 使用ref拿不到toDataURL方法，暂时用创建元素的方法来实现
    newImage.src = defaultAvatar;
    document.querySelector("#crop-img").appendChild(newImage);
  };

  // 确认截取图片
  const submmitCropImg = () => {
    cropImg(document.querySelector("#newImg"));
  };

  // 获取canvas绘制对象
  useEffect(() => {
    setCtx((canvasRef.current as any).getContext("2d"));
  }, []);

  return (
    <div className="piccrop-wrapper">
      <Upload
        accept=".jpg,.jpeg,.pdf,.png"
        onChange={handleUpload}
        onRemove={handleRemove}
        action={action}
        showUploadList={false}
        beforeUpload={beforeUpload}
      >
        <Button>上传图片</Button>
      </Upload>
      <div className="piccrop-wrapper__div-text">{infoText}</div>
      <div className="piccrop-wrapper__wrapper">
        <div className="piccrop-wrapper__left">
          {/* 截取头像的框 */}
          <div
            className="piccrop-wrapper__div-img-box"
            ref={clipBoxWrapper}
            style={{
              width: `${cropBoxSize.width}px`,
              height: `${cropBoxSize.height}px`,
            }}
          >
            {imgUrl && (
              <CropHandler
                ref={clipBox}
                handleMouseDown={handleMouseDown}
                clipDivSize={clipDivSize}
              />
            )}
            <canvas
              ref={canvasRef}
              width={cropBoxSize.width}
              height={cropBoxSize.height}
            />
          </div>
          <Button onClick={submmitCropImg} type="primary" disabled={!imgUrl}>
            {saveBtnInfo ?? "保存形象照以及头像"}
          </Button>
        </div>
        <div className="piccrop-wrapper__right">
          <div className="piccrop-wrapper__right__prelook">
            <div>
              <div
                className="piccrop-wrapper__right__uploadbox"
                style={{
                  width: `${croppedBoxSize.width}px`,
                  height: `${croppedBoxSize.height}px`,
                  borderRadius: `${croppedBoxSize.borderRadius}`,
                }}
              >
                <img
                  style={{ position: "relative" }}
                  ref={previewRef}
                  src={imgUrl || defaultImg || defaultAvatar}
                  width={
                    imgUrl
                      ? (croppedBoxSize.width / clipDivSize.width) *
                        cropBoxSize.width
                      : croppedBoxSize.width
                  }
                  height={
                    imgUrl
                      ? (croppedBoxSize.height / clipDivSize.height) *
                        cropBoxSize.height
                      : croppedBoxSize.height
                  }
                  className="piccrop-wrapper__img-yulan"
                />
                <div
                  id="upload-img-box"
                  className="piccrop-wrapper__right__img-box"
                />
                <div id="img-box" className="piccrop-wrapper__right__img-box" />
              </div>
              <p className="piccrop-wrapper__text-color">查看预览图</p>
            </div>
            <div id="crop-img" className="piccrop-wrapper__right__cropimg" />
          </div>
        </div>
      </div>
    </div>
  );
};

PictureCropper.defaultProps = {
  action: "/api/upload/uploadFile",
  cropBoxSize: {
    width: 164,
    height: 210,
  },
  croppedBoxSize: {
    width: 54,
    height: 54,
    borderRadius: "100%",
  },
  clipDivSize: {
    width: 100,
    height: 100,
  },
};
export default PictureCropper;
