import { useNotebookMetaData } from '@decipad/react-contexts';
import { S } from '@decipad/ui';
import { Close } from 'libs/ui/src/icons';
import { FC, ReactNode } from 'react';

export const EmptyWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const setSidebar = useNotebookMetaData((s) => s.setSidebar);

  return (
    <S.IntegrationWrapper>
      <S.CloseIconWrapper>
        {
          <div onClick={() => setSidebar({ type: 'closed' })}>
            <Close />
          </div>
        }
      </S.CloseIconWrapper>
      {children}
    </S.IntegrationWrapper>
  );
};
