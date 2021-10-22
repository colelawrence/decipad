import { chakra } from '@chakra-ui/system';
import { Box, Table, Tr, Th, Td } from '@chakra-ui/react';

export const TableHeader = chakra(Th, {
  baseStyle: {
    textTransform: 'none',
    fontSize: 'md',
    borderTop: 0,
    borderRight: '1px',
    borderColor: 'gray.100',
    color: 'black',
    wordWrap: 'no-wrap',
    bg: 'transparent',
    _last: {
      borderRight: 0,
    },
  },
});

export const HeaderIcon = chakra(Box, {
  baseStyle: {
    d: 'inline',
    color: 'gray.500',
    marginRight: '0.5em',
  },
});

export const TableRow = chakra(Tr, {
  baseStyle: {
    borderBottom: '1px',
    borderBottomColor: 'gray.100',
    _last: {
      borderBottom: 0,
    },
  },
});

export const TableCell = chakra(Td, {
  baseStyle: {
    bg: 'white',
    borderRight: '1px',
    borderColor: 'gray.100',
    px: 3,
    py: 2.5,
    borderBottom: 0,
    _last: {
      borderRight: 0,
    },
  },
});

export const ResultTable = chakra(Table, {
  baseStyle: {
    tableLayout: 'fixed',
  },
});
