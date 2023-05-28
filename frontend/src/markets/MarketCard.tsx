import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Heading,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react';
import { FC } from 'react';
import { Market } from './domain';

interface Props {
  market: Market;
}

const MarketCard: FC<Props> = ({ market }) => {
  return (
    <Card maxW="sm">
      <CardBody>
        <Image
          src="/shelley-pauls-kuR1Kwo4my4-unsplash.jpg"
          alt="Green double couch with wooden legs"
          borderRadius="lg"
        />
        <Stack mt="6" spacing="3">
          <Heading size="md">{market.name}</Heading>
          <Text>{market.teaser}</Text>
          <Text color="blue.600" fontSize="2xl">
            $450
          </Text>
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter>
        <ButtonGroup spacing="2">
          <Button variant="solid" colorScheme="blue">
            Buy now
          </Button>
          <Button variant="ghost" colorScheme="blue">
            Add to cart
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
};

export default MarketCard;
