import { cssVar } from 'libs/ui/src/primitives';
import { RefObject, useState } from 'react';
import { chartAxisBigFontStyles, chartAxisFontStyles } from '../Charts/styles';

interface EditableSvgLabelProps {
  text?: string;
  onTextChange?: (newText: string) => void;
  textX: number;
  textY: number;
  foreignObjectX: number;
  foreignObjectY: number;
  yAxis?: boolean;
  foreignObjectWidth: number;
  foreignObjectHeight: number;
  textWidth?: number;
  textHeight?: number;
  transform?: string;
  placeholder?: string;
  isExporting?: boolean;
  inputValue?: string;
  setInputValue: (label: string) => void;
  textRef: RefObject<SVGTextElement>;
}

export const EditableAxisLabel = ({
  text,
  onTextChange,
  foreignObjectX,
  foreignObjectY,
  textX,
  textY,
  yAxis = false,
  foreignObjectWidth,
  foreignObjectHeight,
  textWidth,
  textHeight,
  transform,
  placeholder = 'Add label',
  isExporting = false,
  inputValue,
  setInputValue,
  textRef,
}: EditableSvgLabelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const dontRender = onTextChange === undefined;
  const isBigAndCentered = textWidth && textHeight;
  const font = isBigAndCentered ? chartAxisBigFontStyles : chartAxisFontStyles;

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onTextChange && inputValue && onTextChange(inputValue);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const textStyle = text
    ? {
        cursor: 'pointer',
        ...font,
      }
    : {
        ...font,
        cursor: 'pointer',
        fill: cssVar('textDisabled'),
        fontStyle: 'italic',
      };

  if (dontRender) {
    return null;
  }

  let adjustedX = textX;
  let adjustedY = textY;

  if (isBigAndCentered) {
    adjustedY += 5 + textHeight / 2;
    adjustedX =
      textWidth > textHeight
        ? textX
        : -5 + textX + (textHeight - textWidth) / 2;
  }

  if (isEditing) {
    return (
      <foreignObject
        x={isBigAndCentered ? adjustedX : foreignObjectX}
        y={foreignObjectY}
        style={{ ...font, backgroundColor: 'transparent' }}
        width={foreignObjectWidth}
        height={foreignObjectHeight}
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: 'transparent',
            fontSize: 'inherit',
            fontFamily: 'inherit',
            textAlign: yAxis ? 'right' : 'left',
            color: 'inherit',
          }}
          placeholder={placeholder}
        />
      </foreignObject>
    );
  }

  return text || !isExporting ? (
    <text
      x={adjustedX}
      y={adjustedY}
      transform={transform}
      onClick={handleClick}
      style={textStyle}
      ref={textRef}
      data-remove-on-export={text ? 'false' : 'true'}
    >
      {text || placeholder}
    </text>
  ) : null;
};
