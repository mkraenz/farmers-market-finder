import { Box, Flex, HStack, Heading, SimpleGrid } from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import ToggleDarkModeButton from '../common/ThemeButton';
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

  return (
    <Flex
      direction={'column'}
      align={'center'}
      minH={'100vh'}
      minW={'full'}
      mb={'5vh'}
    >
      <HStack justify={'space-between'} minW={'full'} pl={'2vw'} pr={'2vw'}>
        <Box /> {/* fill left block to center the heading */}
        <Heading as={'h1'} size={'xl'} py={8}>
          Farmers Market Finder
        </Heading>
        <ToggleDarkModeButton />
      </HStack>

      <SimpleGrid columns={[1, 2, 3]} spacing={8}>
        {markets.map((market) => (
          <MarketCard market={market} key={market.id} />
        ))}
      </SimpleGrid>
    </Flex>
  );
};

export default MarketsPage;
