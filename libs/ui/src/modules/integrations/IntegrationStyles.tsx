import { Prettify } from '@decipad/utils';
import { css } from '@emotion/react';
import { Edit, Trash } from 'libs/ui/src/icons';
import {
  cssVar,
  p12Bold,
  p12Regular,
  p14Medium,
  p8Medium,
} from '../../primitives';
import { FC, ReactNode, useState } from 'react';
import { Button } from '../../shared';

type IntegrationItemProps = Readonly<{
  icon: ReactNode;
  title: string;
  description: string;

  onClick: () => void;

  testId?: string;
}>;

export const IntegrationItem: FC<IntegrationItemProps> = ({
  icon,
  title,
  description,
  onClick,
  testId,
}) => (
  <div css={IntegrationItemStyled} onClick={onClick} data-testid={testId}>
    <div css={IntegrationItemIconWrapper}>{icon}</div>
    <div css={IntegrationItemTextAndActions}>
      <div>
        <p css={p14Medium}>{title}</p>
        {description.length > 0 && <p css={p12Regular}>{description}</p>}
      </div>
    </div>
  </div>
);

type IntegrationActionItemProps = Prettify<
  IntegrationItemProps & { onEdit: () => void; onDelete: () => void }
>;

export const IntegrationActionItem: FC<IntegrationActionItemProps> = ({
  icon,
  title,
  description,
  testId,
  onEdit,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const onConfirmDelete = () => {
    setIsDeleting(false);

    onDelete();
  };

  if (isDeleting) {
    return (
      <div css={IntegrationActionItemStyled} data-testid={testId}>
        <div css={IntegrationItemIconWrapper}>{icon}</div>
        <div css={IntegrationItemTextAndActions}>
          <div>
            <p css={p14Medium}>{title}</p>
            <p css={p12Regular}>{description}</p>
          </div>
          <div>
            <span css={IntegrationDeleteText}>
              Notebooks with this connection could break.
            </span>
            <Button type="secondary" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button type="primary" onClick={onConfirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div css={IntegrationActionItemStyled} data-testid={testId}>
      <div css={IntegrationItemIconWrapper}>{icon}</div>
      <div css={IntegrationItemTextAndActions}>
        <div>
          <p css={p14Medium}>{title}</p>
          {description.length > 0 && <p css={p12Regular}>{description}</p>}
        </div>
        <div>
          <div onClick={onEdit}>
            <Edit />
          </div>
          <div onClick={() => setIsDeleting(true)}>
            <Trash />
          </div>
        </div>
      </div>
    </div>
  );
};

export const IntegrationDisabledItem: FC<IntegrationItemProps> = ({
  icon,
  title,
  description,
  testId,
}) => (
  <div css={IntegrationActionItemStyled} data-testid={testId}>
    <div css={IntegrationItemIconDisabledWrapper}>{icon}</div>
    <div css={IntegrationItemDisabledTextAndActions}>
      <div>
        <p css={p14Medium}>
          {title} <span css={IntegrationSoonTag}>SOON</span>
        </p>
        <p css={p12Regular}>{description}</p>
      </div>
    </div>
  </div>
);

const IntegrationItemCSS = css({
  display: 'flex',
  padding: '8px',
  alignItems: 'center',
  gap: '12px',

  borderRadius: '8px',
  border: `1px solid ${cssVar('borderSubdued')}`,
});

const IntegrationItemIconWrapper = css({
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  width: '40px',
  height: '40px',
  backgroundColor: cssVar('iconBackground'),
  borderRadius: '8px',

  '& > svg': {
    width: '100%',
    height: '100%',
  },
});

const IntegrationItemTextAndActions = css({
  display: 'flex',
  width: '100%',
  alignItems: 'center',

  p: {
    display: 'flex',
    gap: '4px',
  },

  'div:first-of-type': {
    width: '100%',
    flexDirection: 'column',
    gap: '4px',

    'p:first-of-type': {
      color: cssVar('textTitle'),
    },

    'p:last-of-type': {
      color: cssVar('textSubdued'),
    },
  },

  'div:last-of-type': {
    display: 'flex',
    gap: '4px',
    marginLeft: 'auto',

    div: {
      padding: '6px',
      borderRadius: '4px',
      transition: 'all 0.2s ease-out',
      cursor: 'pointer',
    },

    'div:hover': {
      backgroundColor: cssVar('backgroundDefault'),
    },

    svg: {
      width: '16px',
      height: '16px',
    },
  },
});

const IntegrationItemIconDisabledWrapper = css(IntegrationItemIconWrapper, {
  backgroundColor: cssVar('iconColorSubdued'),
  svg: {
    filter: 'grayscale(1)',
  },
});

const IntegrationItemDisabledTextAndActions = css(
  IntegrationItemTextAndActions,
  {
    p: { color: `${cssVar('textDisabled')} !important` },
  }
);

const IntegrationDeleteText = css(p12Bold, {
  width: '160px',
  textAlign: 'center',
});

const IntegrationSoonTag = css(p8Medium, {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '4px',
  borderRadius: '4px',
  backgroundColor: cssVar('backgroundHeavier'),
});

const IntegrationItemStyled = css(IntegrationItemCSS, {
  cursor: 'pointer',
  transition: 'all 0.2s ease-out',

  ':hover': {
    backgroundColor: cssVar('backgroundDefault'),
  },
});

const IntegrationActionItemStyled = css(IntegrationItemCSS);
