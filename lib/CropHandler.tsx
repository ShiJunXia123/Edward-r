/**
 * @description 截图框组件
 */
import React, { forwardRef } from 'react';
import { SizeObj } from './const';
import './index.less';

type CropHandlerProps = {
  handleMouseDown: (event: MouseEvent | any) => void;
  clipDivSize: SizeObj;
};

const CropHandler = forwardRef((props: CropHandlerProps, ref) => {
  const { handleMouseDown, clipDivSize } = props;

  // 多处使用className，常量定义
  const squire = 'piccrop-wrapper-handler-squire';

  return (
    <div
      id="clip-div"
      className={`${'piccrop-wrapper-handler'}`} // 暂时注释 ${imgUrl && 'picCropWrapper__clipBox-div'} ${!imgUrl && 'displayNone'}
      ref={ref as any}
      onMouseDown={handleMouseDown}
      style={{
        width: `${clipDivSize.width}px`,
        height: `${clipDivSize.height}px`,
      }}
    >
      <div className="piccrop-wrapper-handler-bg" />
      <div className={squire} style={{ left: 0, cursor: 'nw-resize' }} />
      <div className={squire} style={{ left: '50%', cursor: 'n-resize' }} />
      <div className={squire} style={{ right: 0, cursor: 'ne-resize' }} />
      <div className={squire} style={{ top: '50%', cursor: 'w-resize' }} />
      <div className={squire} style={{ right: 0, top: '50%', cursor: 'e-resize' }} />
      <div className={squire} style={{ left: 0, bottom: 0, cursor: 'sw-resize' }} />
      <div className={squire} style={{ left: '50%', bottom: 0, cursor: 's-resize' }} />
      <div className={squire} style={{ right: 0, bottom: 0, cursor: 'se-resize' }} />
    </div>
  );
});

export default CropHandler;
