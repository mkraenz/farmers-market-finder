import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import MarketsPage from './markets/MarketPage';
import store from './store';

const App = () => {
  return (
    <Provider store={store}>
      <ChakraProvider>
        <MarketsPage />
      </ChakraProvider>
    </Provider>
  );
};

export default App;
