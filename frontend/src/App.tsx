import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import MarketsPage from './markets/MarketPage';
import store from './store';
import theme from './theme';

const App = () => {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <MarketsPage />
      </ChakraProvider>
    </Provider>
  );
};

export default App;
