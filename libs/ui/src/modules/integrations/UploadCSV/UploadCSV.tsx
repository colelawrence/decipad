/* eslint decipad/css-prop-named-variable: 0 */
import { FC, useRef, useState } from 'react';
import {
  Button,
  InputField,
  MenuItem,
  MenuList,
  Progress,
} from '../../../shared';
import * as Styled from './styles';
import { useActiveElement } from '@decipad/react-utils';
import { useOnAttachment, useOnImportUrl } from './hooks';
import { ButtonProps } from 'libs/ui/src/shared/atoms/Button/Button';

export const UploadCSV: FC<{
  workspaceId: string;
  afterUpload?: (_: string) => void;
  type?: ButtonProps['type'];
  text?: string;
}> = ({ workspaceId, afterUpload = () => {}, type, text }) => {
  const fileUploadInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<'default' | 'url'>('default');

  const formRef = useActiveElement<HTMLFormElement>(() => setStatus('default'));

  const { onAttachment, progress } = useOnAttachment({
    workspaceId,
    afterUpload,
  });

  const { onImportUrl } = useOnImportUrl({ workspaceId, afterUpload });

  return (
    <Styled.Wrapper>
      {status === 'default' &&
        (!progress ? (
          <>
            <Styled.FileUpload
              ref={fileUploadInputRef}
              type="file"
              accept=".csv"
              onChange={onAttachment}
            />
            <MenuList
              root
              dropdown
              sideOffset={4}
              align="center"
              trigger={
                <div>
                  <Button testId="add-csv" type={type ?? 'primary'}>
                    {text ?? 'Add CSV'}
                  </Button>
                </div>
              }
            >
              <MenuItem
                css={{ minWidth: '120px' }}
                onSelect={() => {
                  fileUploadInputRef.current?.click();
                }}
              >
                Upload file
              </MenuItem>
              <MenuItem
                css={{ minWidth: '120px' }}
                onSelect={() => setStatus('url')}
              >
                Import from link
              </MenuItem>
            </MenuList>
          </>
        ) : (
          <Styled.UploadProgressWrapper>
            <Progress progress={progress} />
          </Styled.UploadProgressWrapper>
        ))}

      {status === 'url' && (
        <>
          <Styled.LinkWrapper ref={formRef} onSubmit={onImportUrl}>
            <InputField
              required
              autoFocus
              testId="csv-link"
              size="small"
              placeholder="Link to CSV"
              pattern="https?://.+" // TODO: should we enforce this?
              name="csvLink"
            />
            <Button submit type="primary" testId="import-link-csv">
              Import
            </Button>
          </Styled.LinkWrapper>
        </>
      )}
    </Styled.Wrapper>
  );
};
