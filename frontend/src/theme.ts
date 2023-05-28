import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      100: '#E6FFFA',
      200: '#B2F5EA',
      300: '#81E6D9',
      400: '#4FD1C5',
      500: '#38B2AC',
      600: '#319795',
      700: '#2C7A7B',
      800: '#285E61',
      900: '#234E52',
    },
  },
});

export default theme;
