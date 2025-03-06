import { FC, useMemo } from 'react';
import JSTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import ReactTimeAgo from 'react-time-ago';

JSTimeAgo.addDefaultLocale(en);
JSTimeAgo.setDefaultLocale('en');

export const TimeAgo: FC<{ timestamp: number | Date }> = ({ timestamp }) => {
  return (
    <ReactTimeAgo
      date={useMemo(
        () => (typeof timestamp === 'number' ? new Date(timestamp) : timestamp),
        [timestamp]
      )}
      locale="en"
    />
  );
};
