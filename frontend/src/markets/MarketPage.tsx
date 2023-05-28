import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import MarketCard from './MarketCard';
import { Market } from './domain';

interface Props {}

const MarketsPage: FC<Props> = (props) => {
  const [markets, setMarkets] = useState<Market[]>([]);

  // Fetch markets data from API and update state
  useEffect(() => {
    const fetchMarkets = async () => {
      const response = await fetch(
        '/api/markets?long=180&lat=90&limit=10&radiusInKm=30000',
      );
      const data = await response.json();
      setMarkets(data);
    };
    fetchMarkets();
  }, []);

  // Render market cards
  const marketCards = markets.map((market) => (
    <Box
      key={market.id}
      bg={useColorModeValue('white', 'gray.800')}
      boxShadow={'lg'}
      rounded={'md'}
      p={6}
      minW={'300px'}
      maxW={'400px'}
      w={'full'}
      mx={'auto'}
      my={4}
    >
      <Heading fontSize={'2xl'} fontFamily={'body'}>
        {market.address}
      </Heading>
      <Text fontWeight={600} color={'gray.500'} mb={4}>
        {market.city}, {market.state} {market.zip}
      </Text>
      <Text fontWeight={400} color={'gray.500'} mb={4}>
        {market.products.join(', ')}
      </Text>
    </Box>
  ));

  return (
    <Flex direction={'column'} align={'center'} minH={'100vh'}>
      <Heading as={'h1'} size={'xl'} py={8}>
        Markets
      </Heading>
      <SimpleGrid columns={[1, 2, 3]} spacing={8}>
        {markets.map((market) => (
          <MarketCard market={market} />
        ))}
      </SimpleGrid>
    </Flex>
  );
};

export default MarketsPage;
