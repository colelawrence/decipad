import { FileType, MAX_UPLOAD_FILE_SIZE } from '@decipad/editor-types';
import { useToast } from '@decipad/toast';
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  isValidURL,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { ChangeEvent, FC, useRef, useState } from 'react';
import { Button, Link } from '../../atoms';
import { Close } from '../../icons';
import { modalDialogStyles } from '../../molecules/Modal/Modal';
import { cssVar, p12Medium, p15Medium } from '../../primitives';
import { closeButtonStyles } from '../../styles/buttons';

interface UploadFileModalProps {
  fileType?: FileType;
  onCancel: () => void;
  onUpload: (file: any, uploadType: string) => void;
}

interface FileCfg {
  title: string;
  maxSize: number;
  accept?: string;
}

const getConfigForFileType = (fileType: FileType | undefined): FileCfg => {
  switch (fileType) {
    case 'image':
      return {
        title: 'Insert image',
        maxSize: MAX_UPLOAD_FILE_SIZE.image,
        accept: 'image/jpeg, image/png, image/gif',
      };
    case 'media':
      return {
        title: 'Insert video',
        maxSize: MAX_UPLOAD_FILE_SIZE.media,
        accept: 'video/*',
      };
    case 'embed':
      return {
        title: 'Embed URL',
        maxSize: MAX_UPLOAD_FILE_SIZE.embed,
      };
    case 'data':
      return {
        title: 'Upload a data file',
        maxSize: MAX_UPLOAD_FILE_SIZE.data,
        accept: '.csv, application/vnd.apache.arrow',
      };
    default:
      return { title: 'Upload a file', maxSize: 5_000_000 };
  }
};

export const UploadFileModal: FC<UploadFileModalProps> = ({
  fileType,
  onCancel,
  onUpload,
}) => {
  const { title, maxSize, accept } = getConfigForFileType(fileType);
  const MAX_LABEL = `${maxSize / 1_000_000}MB`;

  const uploadEnabled = fileType !== 'embed';

  const [activeTab, setActiveTab] = useState(uploadEnabled ? 'upload' : 'link');
  const [fileName, setFileName] = useState('');
  const toast = useToast();

  const handleFileChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const files = evt?.target?.files;
    const uploadFile = files && files[0];
    if (uploadFile) {
      const { size } = uploadFile;
      if (size > maxSize) {
        toast(`Upload failed: File size over ${MAX_LABEL}`, 'warning');
        return;
      }

      onUpload(uploadFile, 'upload');
    } else {
      // no file selected
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <TabsRoot css={allWrapperStyles} defaultValue={activeTab}>
      <div css={titleWrapperStyles}>
        <div css={titleStyles}>{title}</div>
        <div css={iconStyles}>
          <div css={closeButtonStyles} role="button" onClick={onCancel}>
            <Close />
          </div>
        </div>
      </div>
      {uploadEnabled && (
        <div css={tabWrapStyles} defaultValue={activeTab}>
          <TabsList>
            <TabsTrigger
              name="upload"
              testId="upload-file-tab"
              trigger={{
                label: 'Upload',
                onClick: () => setActiveTab('upload'),
                disabled: false,
                selected: activeTab === 'upload',
              }}
            />

            <TabsTrigger
              name="link"
              testId="link-file-tab"
              trigger={{
                label: 'Link',
                onClick: () => setActiveTab('link'),
                disabled: false,
                selected: activeTab === 'link',
              }}
            />
          </TabsList>
        </div>
      )}
      <div css={importFileWrapperStyles}>
        <TabsContent name="link">
          <div css={importFileActionStyles}>
            <input
              data-testid="upload-link-input"
              css={inputStyles}
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
            <Button
              key="link-button"
              testId="link-button"
              type="primary"
              onClick={() => onUpload(fileName, 'link')}
              disabled={!isValidURL(fileName)}
            >
              Insert
            </Button>
          </div>
        </TabsContent>
        <TabsContent name="upload">
          <div css={importFileActionStyles}>
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              ref={fileInputRef}
              css={hiddenElement}
            />
            <Button
              key="upload-button"
              type="primary"
              onClick={handleButtonClick}
            >
              Choose file
            </Button>
          </div>
        </TabsContent>
      </div>
      <span css={p12Medium}>
        Embeds are experimental. Check out{' '}
        <Link href="https://app.decipad.com/docs/quick-start/embed-on-decipad">
          the docs
        </Link>{' '}
        if you run into issues.
      </span>
    </TabsRoot>
  );
};

const hiddenElement = css({
  display: 'none',
});

const iconStyles = css({
  marginLeft: 'auto',

  height: '30px',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end',

  div: {
    width: '16px',
    height: '16px',
  },
});

const inputStyles = css({
  background: cssVar('backgroundMain'),
  borderRadius: '6px',
  padding: '6px 12px',
  border: `1px solid ${cssVar('borderSubdued')}`,

  width: '100%',
});

const importFileActionStyles = css({
  display: 'flex',
  gap: '8px',

  button: {
    flex: '0 0 120px',
  },
});

const importFileWrapperStyles = css({
  width: '100%',

  backgroundColor: cssVar('backgroundDefault'),
  borderRadius: '6px',

  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '12px',
});

const wrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '32px',
  gap: '12px',
});

const titleStyles = css(p15Medium, {
  lineHeight: '30px',
  paddingLeft: '5px',
  paddingRight: '15px',
  width: '100%',
});

const titleWrapperStyles = css({
  color: cssVar('textHeavy'),
  height: '30px',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'end',
});

const tabWrapStyles = css({
  width: '100%',
});

const allWrapperStyles = [wrapperStyles, modalDialogStyles];
