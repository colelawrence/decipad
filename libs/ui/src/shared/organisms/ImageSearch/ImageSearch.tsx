/* eslint decipad/css-prop-named-variable: 0 */
import { ReplicateModels } from '@decipad/shared-config';
import { css } from '@emotion/react';
import axios from 'axios';
import { MagnifyingGlass } from 'libs/ui/src/icons';
import { useState } from 'react';
import { JellyBeans } from '../../atoms';
import { ImageGallery, ImageUrlWithMetadata } from './ImageGallery';
import SearchForm from './SearchForm';

type ApiSource = 'giphy' | 'unsplash' | 'replicate';

type ImageSearchProps = {
  insertFromPreview: (url: string, trackerUrl?: string) => void;
  apiSource: ApiSource;
  beans?: string[];
  workspaceId: string;
};

const placeholders = {
  giphy: `Search Giphy`,
  unsplash: `Search Unsplash`,
  replicate: 'Describe the image you want and we will generate it for you',
};

function isImageUrlWithMetadata(item: any): item is ImageUrlWithMetadata {
  return (
    typeof item === 'object' &&
    'url' in item &&
    'user' in item &&
    'userProfile' in item
  );
}

export const ImageSearch = ({
  insertFromPreview,
  apiSource,
  workspaceId,
  beans,
}: ImageSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [imageUrls, setImageUrls] = useState<
    string[] | ImageUrlWithMetadata[] | null
  >(null);
  const [loading, setLoading] = useState(false);

  const handleSearchChange = (src: string) => {
    setSearchTerm(src);
  };

  const handleSearchSubmit = async (
    selectedDropdownValue = '',
    text = searchTerm
  ) => {
    setLoading(true);
    setSelectedModel(selectedDropdownValue); // Update the state with the selected model

    const apiEndpoints = {
      giphy: `/api/image/gif`,
      unsplash: `/api/image/stock`,
      replicate: '/api/image/generate',
    };

    const url = apiEndpoints[apiSource];

    try {
      const response = await axios.post(url, {
        prompt: text,
        fn: selectedDropdownValue,
        workspaceId,
      });
      const { images } = response.data;

      if (images.every(isImageUrlWithMetadata)) {
        setImageUrls(images as ImageUrlWithMetadata[]);
      } else {
        setImageUrls(images as string[]);
      }
      setLoading(false);
    } catch (error) {
      console.error(error, searchTerm);
      setImageUrls([]);
      setLoading(false);
      console.error('Error fetching images: ', error);
    }
  };

  // Determine the count for the loading placeholders or the actual images
  let count = 50;
  if (apiSource === 'replicate') {
    const model = ReplicateModels.find(
      (m: { label: string }) => m.label === selectedModel
    );
    count = model ? model.outputs : 4; // Default to 4 if model not found
  }

  return (
    <>
      <SearchForm
        searchTerm={searchTerm}
        placeholder={placeholders[apiSource]}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        label={apiSource === 'replicate' ? 'Generate' : 'Search'}
        icon={apiSource === 'replicate' ? null : <MagnifyingGlass />}
        showButton={!beans}
        variant={apiSource === 'replicate'}
        dropdownChoices={
          apiSource === 'replicate' ? ReplicateModels : undefined
        }
        disabled={loading}
      />

      {beans && (
        <div css={beansMarginsStyles}>
          <JellyBeans
            beans={beans.map((text) => ({
              text,
              onClick: () => {
                handleSearchChange(text);
                handleSearchSubmit('', text);
              },
            }))}
          />
        </div>
      )}

      {(imageUrls || loading) && (
        <ImageGallery
          imageUrls={imageUrls || undefined}
          loading={loading}
          apiSource={apiSource}
          count={count}
          insertFromPreview={insertFromPreview}
        />
      )}
    </>
  );
};

const beansMarginsStyles = css({ marginTop: 4 });
