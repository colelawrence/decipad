import { useMemo } from 'react';

import { css } from '@emotion/react';

import FormulaList from './FormulaList/FormulaList';

function Modelling({ search, items, onDragStart, onDragEnd }: any) {
  const filteredItems = useMemo(() => {
    const formulas = items;
    if (!search) {
      return formulas;
    }

    return formulas.filter((item: any) => {
      return item.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [search]);

  return (
    <div css={fade_up}>
      <FormulaList
        items={filteredItems}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    </div>
  );
}

const fade_up = css({
  animation: 'fade-up 0.3s ease',

  '@keyframes fade-up': {
    '0%': {
      opacity: '0',
      transform: 'translateY(20px)',
    },
    '100%': {
      opacity: '1',
      transform: 'translateY(0)',
    },
  },
});

export default Modelling;
