import styled from '@emotion/styled';
import { cssVar, mobileQuery, smallestMobile } from '../../primitives';

export const S = {
  IntegrationWrapper: styled.div({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '500px',
    height: '662px',
    maxHeight: 'calc(100vh - 40px)',
    padding: '32px',
    gap: '20px',

    border: `1px solid ${cssVar('backgroundDefault')}`,
    borderRadius: '24px',

    backgroundColor: cssVar('backgroundMain'),
    [mobileQuery]: { width: smallestMobile.landscape.width },

    section: {
      width: '100%',
    },
  }),
  CloseIconWrapper: styled.div({
    height: '30px',
    display: 'flex',

    justifyContent: 'right',
    alignItems: 'center',

    width: '100%',

    div: {
      marginLeft: 'auto',
      width: '16px',
      height: '16px',
      display: 'grid',
      borderRadius: 4,
      ':hover': {
        backgroundColor: cssVar('backgroundHeavy'),
      },
    },
  }),
} as const;
