import React, { useState } from 'react';
import './ImageAnnotation.css';

const RenderRectangleAnnotation = ({
  number,
  isHovered,
  handleNumberMouseEnter,
  handleNumberMouseLeave,
  circleColor,
  circleHoverColor,
  circleTextColor,
}) => {
  const { xPercent, yPercent, value, tooltip, widthPercent, heightPercent } =
    number;

  return (
    <div
      className={`rectangle-annotation ${isHovered ? 'pulse' : ''} ${
        isHovered ? 'hovered' : ''
      }`}
      style={{
        position: 'absolute',
        top: `${yPercent}%`,
        left: `${xPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
      }}
      data-number={value}
      onMouseEnter={() => handleNumberMouseEnter(number)}
      onMouseLeave={handleNumberMouseLeave}
    >
      <div className={`rectangle-value ${isHovered ? 'hovered' : ''}`}>
        {value}
      </div>
      {isHovered && tooltip && (
        <div
          className="tooltip"
          dangerouslySetInnerHTML={{ __html: tooltip }}
        />
      )}
    </div>
  );
};

const RenderCircleAnnotation = ({
  number,
  isHovered,
  handleNumberMouseEnter,
  handleNumberMouseLeave,
  circleColor,
  circleHoverColor,
  circleTextColor,
}) => {
  const { xPercent, yPercent, value, tooltip } = number;

  return (
    <div
      style={{
        position: 'absolute',
        top: `${yPercent}%`,
        left: `${xPercent}%`,
        transform: 'translate(-50%, -50%)',
      }}
      data-number={value}
    >
      <div
        style={{
          minWidth: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: isHovered ? circleHoverColor : circleColor,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: circleTextColor,
          fontWeight: 'bold',
          cursor: 'pointer',
          animation: `${isHovered ? 'pulse 2s infinite' : 'none'}`,
        }}
        onMouseEnter={() => handleNumberMouseEnter(number)}
        onMouseLeave={handleNumberMouseLeave}
      >
        {value}
      </div>
      {isHovered && tooltip && (
        <div
          className="tooltip"
          dangerouslySetInnerHTML={{ __html: tooltip }}
        />
      )}
    </div>
  );
};

const BottomNavigationArrow = ({
  isFirstLiSelected,
  isLastLiSelected,
  handleNumberMouseEnter,
  steps,
  hoveredNumber,
}) => {
  const circleTextColor = 'white';

  const handlePreviousClick = () => {
    if (!isFirstLiSelected) {
      const currentIndex = steps.findIndex(
        (number) => number === hoveredNumber
      );
      const previousNumber =
        currentIndex > 0 ? steps[currentIndex - 1] : steps[steps.length - 1];
      handleNumberMouseEnter(previousNumber);
    }
  };

  const handleNextClick = () => {
    if (!isLastLiSelected) {
      const currentIndex = steps.findIndex(
        (number) => number === hoveredNumber
      );
      const nextNumber =
        currentIndex < steps.length - 1 ? steps[currentIndex + 1] : steps[0];
      handleNumberMouseEnter(nextNumber);
    }
  };

  const [isHoveredBack, setIsHoveredBack] = useState(false);

  const [isHoveredNext, setIsHoveredNext] = useState(false);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '18px',
          transform: 'translateY(-50%)',
          opacity: isFirstLiSelected ? 0.3 : 0.6,
        }}
      >
        <div
          style={{
            minWidth: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: circleTextColor,
            fontWeight: 'bold',
            cursor: isFirstLiSelected ? 'not-allowed' : 'pointer',
            opacity: isFirstLiSelected ? 0.3 : isHoveredBack ? 0.8 : 0.6,
          }}
          onClick={handlePreviousClick}
          onMouseEnter={() => setIsHoveredBack(true)}
          onMouseLeave={() => setIsHoveredBack(false)}
        >
          &#9664;
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '55px',
          transform: 'translateY(-50%)',
          opacity: isLastLiSelected ? 0.3 : 0.6,
        }}
      >
        <div
          style={{
            minWidth: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: circleTextColor,
            fontWeight: 'bold',
            cursor: isLastLiSelected ? 'not-allowed' : 'pointer',
            opacity: isLastLiSelected ? 0.3 : isHoveredNext ? 0.8 : 0.6,
          }}
          onClick={handleNextClick}
          onMouseEnter={() => setIsHoveredNext(true)}
          onMouseLeave={() => setIsHoveredNext(false)}
        >
          &#9654;
        </div>
      </div>
    </>
  );
};

const DescriptionList = ({
  steps,
  hoveredNumber,
  handleNumberMouseEnter,
  handleNumberMouseLeave,
}) => {
  const circleColor = 'var(--ifm-color-primary-light)';
  const circleHoverColor = 'var(--ifm-menu-color-active)';
  const circleTextColor = 'white';

  return (
    <>
      {steps.some((number) => number.description) && (
        <ol style={{ listStyleType: 'none', paddingLeft: '10px' }}>
          {steps.map((number, index) => {
            if (!number.description) {
              return null; // Skip rendering if description is not present
            }
            const isHovered = hoveredNumber === number;
            return (
              <li
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '10px',
                }}
                onMouseEnter={() => handleNumberMouseEnter(number)}
                onMouseLeave={handleNumberMouseLeave}
              >
                <div
                  style={{
                    minWidth: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isHovered ? circleHoverColor : circleColor,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: circleTextColor,
                    fontWeight: 'bold',
                    marginRight: '8px',
                  }}
                >
                  {number.value}
                </div>
                <div dangerouslySetInnerHTML={{ __html: number.description }} />
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
};

const ImageAnnotation = ({
  src,
  caption,
  steps,
  isOnlyOnHover,
  noNumbers,
  firstSelectedByDefault,
  navigationButtons,
}) => {
  const [hoveredNumber, setHoveredNumber] = useState(null);

  const handleNumberMouseEnter = (number) => {
    setHoveredNumber(number);
  };

  const handleNumberMouseLeave = () => {
    if (firstSelectedByDefault || navigationButtons) {
      return;
    }
    setHoveredNumber(null);
  };

  const circleColor = 'var(--ifm-color-primary-light)';
  const circleHoverColor = 'var(--ifm-menu-color-active)';
  const circleTextColor = 'white';

  const firstNumber = steps[0]; // Get the first number
  const lastNumber = steps[steps.length - 1]; // Get the last number

  // Set the first number as hovered if firstSelectedByDefault is true
  if (firstSelectedByDefault && !hoveredNumber) {
    handleNumberMouseEnter(firstNumber);
  }

  const isFirstLiSelected = hoveredNumber === firstNumber;
  const isLastLiSelected = hoveredNumber === lastNumber;

  return (
    <div style={{ marginBottom: '38px' }}>
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          marginBottom: caption ? '5px' : '24px',
        }}
      >
        {navigationButtons && (
          <BottomNavigationArrow
            isFirstLiSelected={isFirstLiSelected}
            isLastLiSelected={isLastLiSelected}
            handleNumberMouseEnter={handleNumberMouseEnter}
            steps={steps}
            hoveredNumber={hoveredNumber}
          />
        )}
        <img
          src={hoveredNumber ? hoveredNumber.src : steps[0].src}
          alt={hoveredNumber ? hoveredNumber.alt : steps[0].alt}
          className="annotation-img"
        />
        {steps.map((number, index) => {
          const isHovered = hoveredNumber === number;
          const { widthPercent, heightPercent } = number;
          if (widthPercent && heightPercent) {
            // Render rectangle annotation
            return (
              <span
                style={{
                  display: isOnlyOnHover && !isHovered ? 'none' : 'inherit',
                }}
              >
                <RenderRectangleAnnotation
                  key={index}
                  isHovered={isHovered}
                  number={number}
                  handleNumberMouseEnter={handleNumberMouseEnter}
                  handleNumberMouseLeave={handleNumberMouseLeave}
                  circleColor={circleColor}
                  circleHoverColor={circleHoverColor}
                  circleTextColor={circleTextColor}
                />
              </span>
            );
          }
          // Render circle annotation
          return (
            <RenderCircleAnnotation
              key={index}
              isHovered={isHovered}
              number={number}
              handleNumberMouseEnter={handleNumberMouseEnter}
              handleNumberMouseLeave={handleNumberMouseLeave}
              circleColor={circleColor}
              circleHoverColor={circleHoverColor}
              circleTextColor={circleTextColor}
            />
          );
        })}
      </div>
      {caption && <p dangerouslySetInnerHTML={{ __html: caption }} />}
      <DescriptionList
        steps={steps}
        hoveredNumber={hoveredNumber}
        handleNumberMouseEnter={handleNumberMouseEnter}
        handleNumberMouseLeave={handleNumberMouseLeave}
      />
    </div>
  );
};

export default ImageAnnotation;

/*
Example



import ImageAnnotation from '@site/src/components/ImageAnnotation/ImageAnnotation';

import AddBlocks0 from './img/AddBlocks0.png';
import AddBlocks from './img/AddBlocks.png';

<ImageAnnotation
steps={[
{
src: AddBlocks0,
xPercent: 16,
yPercent: 38,
widthPercent: 37,
heightPercent: 6.5,
value: "1",
description: `Click the <code>+</code> button located next to an empty line.<br/> Alternatively, use the keyboard shortcut by typing <code>/</code> on a new empty line.`,
},
{
src: AddBlocks,
xPercent: 20,
yPercent: 46.5,
widthPercent: 30,
heightPercent: 10,
value: "2",
description: `Select the desired block from the menu that appears.`,
},
]}
alt="Custom Formula Example"
navigationButtons
firstSelectedByDefault
isOnlyOnHover
/>

*/

/*
Example


import ImageAnnotation from '@site/src/components/ImageAnnotation/ImageAnnotation';

<ImageAnnotation
src="http://localhost:3000/docs/img/thumbnails/thumbnail-first-notebook.png"
alt="Your Image"
numbers={[
{ xPercent: 50, yPercent: 25, value: 1, tooltip: 'Tooltip 1' },
{ xPercent: 70, yPercent: 10, value: 2, description: 'Description 2', tooltip: `<b>Tooltip</b> <br/> 2 dasd dsa sd sdasd das` },
{ xPercent: 20, yPercent: 10, value: 3, description: 'Description 3' },
{ xPercent: 20, yPercent: 20, value: 5, tooltip: 'Rectangle Tooltip', widthPercent: 20, heightPercent: 60, description: 'Description 5' },
{
xPercent: 30,
yPercent: 10,
value: 4,
description: `

<li>
<strong>Add Formulas to a Table:</strong>
<ul>
<li>You can add formulas to a table by clicking on any cell and starting with the equals sign (=).</li>
<li>Alternatively, you can add formulas to a column by clicking on the column &#9660; and selecting <code>Formula</code>.</li>
</ul>
</li>
`,
},
]}
/>



*/
