export type Market = {
  id: string;
  name: string;
  teaser: string;
  address: string;
  city: string;
  state: string;
  location: {
    lat: number;
    long: number;
  };
  zip: string;
  country: string;
  products: string[];
  distance?: number | undefined;
  images?:
    | {
        url: string;
        description: string;
      }[]
    | undefined;
};
