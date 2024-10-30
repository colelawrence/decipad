import { Prettify } from '@decipad/utils';
import { p12Regular, p14Medium } from '../../../primitives';
import { FC, ReactNode, useState } from 'react';
import { Button, Loading } from '../../../shared';
import {
  IntegrationItemStyled,
  IntegrationItemIconWrapper,
  IntegrationActionItemStyled,
  IntegrationDeleteText,
  IntegrationItemIconDisabledWrapper,
  IntegrationItemDisabledTextAndActions,
  IntegrationSoonTag,
} from './styles';

type IntegrationItemProps = Readonly<{
  icon: ReactNode;
  title: string;
  description: string;
  variant?: 'sidebar' | 'modal';

  onClick: () => void;
  isOperationInprogress?: boolean;
  testId?: string;
}>;

export const IntegrationItem: FC<IntegrationItemProps> = ({
  icon,
  title,
  description,
  onClick,
  testId,
  variant = 'sidebar',
}) => {
  return (
    <div
      css={IntegrationItemStyled}
      data-variant={variant}
      data-testid={variant === 'sidebar' && testId}
      onClick={() => {
        if (variant !== 'sidebar') return;
        onClick();
      }}
    >
      <div css={IntegrationItemIconWrapper}>{icon}</div>
      <h2 css={p14Medium}>{title}</h2>
      {description.length > 0 && <p css={p12Regular}>{description}</p>}
      <span>
        {variant === 'modal' && (
          <Button type="secondary" onClick={onClick} testId={testId}>
            Connect
          </Button>
        )}
      </span>
    </div>
  );
};

type IntegrationActionItemProps = Prettify<
  IntegrationItemProps & {
    onEdit: (() => void) | undefined;
    onDelete: () => void | Promise<any>;
  }
>;

export const IntegrationActionItem: FC<IntegrationActionItemProps> = ({
  icon,
  title,
  description,
  testId,
  onEdit,
  onDelete,
  variant = 'sidebar',
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteInProgress, setIsDeleteInProgress] = useState(false);
  const [isEditInProgress, setIsEditInProgress] = useState(false);

  const onConfirmDelete = async () => {
    setIsDeleting(false);
    setIsDeleteInProgress(true);
    await onDelete();
    setIsDeleteInProgress(false);
  };

  return (
    <div
      css={IntegrationActionItemStyled}
      data-variant={variant}
      data-single={description.length === 0}
      data-testid={testId}
    >
      <div css={IntegrationItemIconWrapper}>{icon}</div>
      <h2 css={p14Medium}>{title}</h2>
      {description.length > 0 && <p css={p12Regular}>{description}</p>}
      <span>
        {isDeleting && (
          <span css={IntegrationDeleteText}>
            Notebooks with this connection could break
          </span>
        )}
        {onEdit != null && (
          <Button
            type="secondary"
            onClick={() => {
              if (isDeleting) {
                setIsDeleting(false);
                return;
              }
              setIsEditInProgress(true);
              onEdit();
            }}
            disabled={isDeleteInProgress || isEditInProgress}
          >
            {isDeleting ? 'Cancel' : 'Edit'}
            {isEditInProgress && (
              <Loading width="16px" style={{ marginLeft: '6px' }} />
            )}
          </Button>
        )}
        <Button
          type={isDeleting ? 'danger' : 'secondary'}
          onClick={() => {
            if (isDeleting) onConfirmDelete();
            else setIsDeleting(true);
          }}
          disabled={isDeleteInProgress || isEditInProgress}
        >
          Delete{' '}
          {isDeleteInProgress && (
            <Loading width="16px" style={{ marginLeft: '6px' }} />
          )}
        </Button>
      </span>
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
