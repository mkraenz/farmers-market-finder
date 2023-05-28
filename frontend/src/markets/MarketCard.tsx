import { Card, CardBody, Heading, Image, Stack, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { Market } from './domain';

interface Props {
  market: Market;
}

const MarketCard: FC<Props> = ({ market }) => {
  const image = market.images[0] as Market['images'][number] | undefined; // array may be empty
  const imageUrl = image?.url || '/shelley-pauls-kuR1Kwo4my4-unsplash.jpg';
  const imageAlt =
    image?.description || 'Placeholder image of a farmers market';
  const handleClick = () => {
    console.log('clicked');
  };
  return (
    <Card maxW="sm" onClick={handleClick} cursor={'pointer'}>
      <CardBody>
        <Image src={imageUrl} alt={imageAlt} borderRadius="lg" />
        <Stack mt="6" spacing="3">
          <Heading size="md">{market.name}</Heading>
          <Text>{market.teaser}</Text>
          <Text color="brand.600" fontSize="2xl">
            Wed, Fri, Mon
          </Text>
          <Text fontWeight={600} color={'gray.500'} mb={4}>
            {market.city}, {market.state} {market.zip}
          </Text>
          <Text fontWeight={400} color={'gray.500'} mb={4}>
            {market.products.join(', ')}
          </Text>
        </Stack>
      </CardBody>
      {/* <CardFooter>
        <ButtonGroup spacing="2">
          <Button variant="solid" colorScheme="brand">
            View details
          </Button>
        </ButtonGroup>
      </CardFooter> */}
    </Card>
  );
};

export default MarketCard;
