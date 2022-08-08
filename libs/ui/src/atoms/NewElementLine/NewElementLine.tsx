import { css } from '@emotion/react';
import { FC, useState, useEffect } from 'react';
import { blue200 } from '../../primitives';

const parentWrapper = css({
  position: 'relative',
  width: '100%',
  height: 0,
});
const addElementLineWrapper = css({
  width: '100%',
  height: 20,
  paddingTop: 4,
  paddingBottom: 4,
  position: 'absolute',
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
  opacity: 0,
  transition: 'all 0.2s ease',
  '&:hover': {
    opacity: 1,
  },
});

const addElementLine = css({
  width: '100%',
  height: 3,
  backgroundColor: blue200.rgb,
});

interface NewElementLineProps {
  readonly onAdd: (() => void) | undefined;
  readonly show: boolean;
}

export const NewElementLine = ({
  onAdd,
  show = true,
}: NewElementLineProps): ReturnType<FC> => {
  const [clicked, setClicked] = useState<boolean>(false);

  useEffect(() => {
    if (clicked) {
      setTimeout(() => setClicked(false), 1000);
    }
  }, [clicked]);

  if (!show) {
    return <></>;
  }

  return (
    <div
      css={[parentWrapper, clicked ? { opacity: 0 } : {}]}
      contentEditable={false}
    >
      <div
        css={addElementLineWrapper}
        onClick={() => {
          setClicked(true);
          if (onAdd !== undefined) onAdd();
        }}
      >
        <span css={addElementLine} />
      </div>
    </div>
  );
};
