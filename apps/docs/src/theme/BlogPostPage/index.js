import React from 'react';
// eslint-disable-next-line import/no-unresolved
import BlogPostPage from '@theme-original/BlogPostPage';

export default function BlogPostPageWrapper(props) {
  return (
    <>
      <BlogPostPage {...props} />
    </>
  );
}
