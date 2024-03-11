import { workspaces } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import { css } from '@emotion/react';
import {
  Close,
  Giphy,
  Link as LinkIcon,
  Replicate,
  Unsplash,
} from 'libs/ui/src/icons';
import SearchForm from 'libs/ui/src/shared/organisms/ImageSearch/SearchForm';
import { ChangeEvent, FC, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { p12Medium, p14Regular } from '../../../primitives';
import {
  Button,
  ImageSearch,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from '../../../shared';
import { closeButtonStyles } from '../../../styles/buttons';
import { isValidURL } from '../../../utils';
import DragArea from './DragArea';
import { SelectedFile } from './SelectedFile';
import { getConfigForFileType, giphyBeans, unsplashBeans } from './fileConfigs';
import {
  allWrapperStyles,
  gap,
  hiddenElement,
  iconContainerStyle,
  iconStyles,
  imageOverSizeStyles,
  importFileActionStyles,
  importFileWrapperStyles,
  tabWrapStyles,
  titleWrapperStyles,
  uploadTitleStyles,
  wrapperForImageGallery,
} from './styles';
import { UploadFileModalProps } from './types';

export const UploadFileModal: FC<UploadFileModalProps> = ({
  fileType,
  onCancel,
  onUpload,
  uploading,
  uploadProgress,
  workspaceId,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const { title, maxSize, accept, description, addons, acceptHuman } =
    getConfigForFileType(fileType);
  const { giphy, unsplash, replicate } = addons;
  const navigate = useNavigate();

  const processFile = (file?: File) => {
    if (!file) {
      toast('Please upload one file at a time', 'warning');
      return;
    }
    setSelectedFile(file);
    setFileError(null);
    if (file.size > maxSize) {
      const limit = Math.round(maxSize / 1_000_000);
      toast(
        <div>
          <span>
            Your {fileType} is over {limit}MB.
          </span>
          <span>&nbsp;</span>
          <span
            css={imageOverSizeStyles}
            onClick={() => {
              if (workspaceId) {
                navigate(
                  workspaces({})
                    .workspace({
                      workspaceId,
                    })
                    .members({}).$,
                  { replace: true }
                );
              }
            }}
          >
            Upgrade to increase limits
          </span>
        </div>,
        'error'
      );
      setFileError(`Upload failed: File size over ${limit}MB`);
      return;
    }

    const fileTypeAllowed = (accept || '').split(', ').includes(file.type);
    if (!fileTypeAllowed) {
      setFileError(`Upload failed: File type not allowed ${file.type}`);
      return;
    }

    onUpload(file, 'upload');
  };

  const uploadEnabled = fileType !== 'embed';

  const [fileName, setFileName] = useState('');
  const toast = useToast();

  const handleFileChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const files = evt?.target?.files;
    const uploadFile = files && files[0];
    processFile(uploadFile || undefined);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const insertFromPreview = (url: string) => {
    onUpload(url, 'link');
  };

  return (
    <TabsRoot
      styles={allWrapperStyles}
      defaultValue={uploadEnabled ? 'upload' : 'link'}
    >
      <div css={titleWrapperStyles}>
        <div css={uploadTitleStyles}>{title}</div>
        <div css={iconStyles}>
          <div css={closeButtonStyles} role="button" onClick={onCancel}>
            <Close />
          </div>
        </div>
      </div>
      <div css={p14Regular}>
        {description && <span css={p12Medium}>{description}</span>}
      </div>
      {uploadEnabled && (
        <div css={tabWrapStyles}>
          <TabsList>
            <TabsTrigger
              name="upload"
              testId="upload-file-tab"
              trigger={{
                label: 'Upload',
                disabled: false,
              }}
            />

            <TabsTrigger
              name="link"
              testId="link-file-tab"
              trigger={{
                label: 'Link',
                disabled: false,
              }}
            />
            {replicate && (
              <TabsTrigger
                name="replicate"
                testId="replicate-tab"
                trigger={{
                  label: 'Replicate',
                  icon: (
                    <div css={iconContainerStyle}>
                      <Replicate />
                    </div>
                  ),
                  disabled: false,
                }}
              />
            )}
            {giphy && (
              <TabsTrigger
                name="giphy"
                testId="giphy-tab"
                trigger={{
                  label: 'Giphy',
                  icon: (
                    <div css={iconContainerStyle}>
                      <Giphy />
                    </div>
                  ),
                  disabled: false,
                }}
              />
            )}

            {unsplash && (
              <TabsTrigger
                name="unsplash"
                testId="unsplash-tab"
                trigger={{
                  label: 'Unsplash',
                  icon: (
                    <div css={iconContainerStyle}>
                      <Unsplash />
                    </div>
                  ),
                  disabled: false,
                }}
              />
            )}
          </TabsList>
        </div>
      )}
      <div css={importFileWrapperStyles}>
        <TabsContent name="replicate">
          <div css={wrapperForImageGallery}>
            <ImageSearch
              workspaceId={workspaceId}
              insertFromPreview={insertFromPreview}
              apiSource="replicate"
              apiKey={process.env.REPLICATE_API_KEY}
            />
          </div>
        </TabsContent>
        <TabsContent name="link">
          <SearchForm
            data-testid="upload-link-input"
            searchTerm={fileName}
            icon={<LinkIcon />}
            label={`Insert ${fileType}`}
            placeholder={`Paste the ${fileType} link here`}
            onSearchChange={(newSearch) => setFileName(newSearch)}
            onSearchSubmit={() => onUpload(fileName, 'link')}
            disabled={!isValidURL(fileName)}
          />
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
            <DragArea
              processFile={processFile}
              acceptHuman={acceptHuman}
              fileType={fileType}
              maxSize={maxSize}
              uploadProgress={uploadProgress}
            />
            {selectedFile && (
              <SelectedFile
                selectedFile={selectedFile}
                fileError={fileError}
                removeSelectedFile={removeSelectedFile}
              />
            )}
            <Button
              styles={css({ marginTop: 24 - gap })}
              key="upload-button"
              type="primary"
              disabled={uploading}
              onClick={handleButtonClick}
            >
              Choose file
            </Button>
          </div>
        </TabsContent>
        <TabsContent name="giphy">
          <div css={wrapperForImageGallery}>
            <ImageSearch
              workspaceId={workspaceId}
              insertFromPreview={insertFromPreview}
              apiSource="giphy"
              beans={giphyBeans}
              apiKey={process.env.GIPHY_API_KEY}
            />
          </div>
        </TabsContent>
        <TabsContent name="unsplash">
          <div css={wrapperForImageGallery}>
            <ImageSearch
              workspaceId={workspaceId}
              insertFromPreview={insertFromPreview}
              apiSource="unsplash"
              apiKey={process.env.UNSPLASH_API_KEY}
              beans={unsplashBeans}
            />
          </div>
        </TabsContent>
      </div>
    </TabsRoot>
  );
};
