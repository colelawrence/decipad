import styled from '@emotion/styled';
import {
  cssVar,
  mobileQuery,
  p14Medium,
  p14Regular,
  smallestMobile,
} from '../../primitives';
import { noTrackScrollbarStyles } from '../../styles/scrollbars';
import { sidebarWrapperStyles } from '../sidebar/EditorSidebar/styles';

export const S = {
  IntegrationWrapper: styled.div(noTrackScrollbarStyles, sidebarWrapperStyles, {
    alignItems: 'center',
    // width: '500px',
    maxHeight: 'calc(100vh - 40px)',
    overflowY: 'auto',
    gap: '16px',
    paddingRight: '16px',

    [mobileQuery]: { width: smallestMobile.landscape.width },

    section: {
      width: '100%',
    },
    '& > main': {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '100%',

      '& > p': {
        ...p14Medium,
        width: '100%',
        textAlign: 'center',
      },
    },
  }),
  CloseIconWrapper: styled.div({
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    width: '100%',

    h2: { ...p14Regular, color: cssVar('textTitle') },

    // back button + close button
    svg: {
      stroke: cssVar('textTitle'),
      width: '16px',
      height: '16px',
      cursor: 'pointer',
    },
    // 'div:last-child > svg': {
    //  width: '28px',
    //  height: '28px',
    //  padding: '6px',
    // },
    button: {
      width: '28px',
      height: '28px',
      flexGrow: '0',
      padding: '6px',
      '&:hover': {
        backgroundColor: cssVar('backgroundHeavy'),
        borderRadius: '6px',
      },
      '&:last-child': {
        color: cssVar('textDisabled'),
      },
    },
    span: {
      flexGrow: '1',
    },
  }),
} as const;
