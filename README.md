# Market Finder

## Stories

- [ ] As a market owner, I want to add my market to the list, so that I can attract more customers.
- [ ] As a user, I want to find markets near me, so that I can buy fresh produce.

## Requirements

### As a market owner, I want to add my market to the list, so that I can attract more customers

Create a new market ->
Endpoint: `POST /markets`
Data:

```json
{
  "name": "Market Name",
  "address": "123 Market St",
  "city": "City",
  "state": "ST",
  "country": "US",
  "location": {
    "lat": 23.45,
    "lng": 34.56
  },
  "zip": "12345",
  "products": ["Apples", "Oranges", "Bananas"]
}
```

Get all markets -> Endpoint `GET /markets`
Get a market by id -> Endpoint `GET /markets/:id`

### As a user, I want to find markets near me, so that I can buy fresh produce

Get markets near me -> Endpoint `GET /markets?lat=23.45&lng=34.56&radius=10`
where `lat` and `lng` are the user's current location and radius is the maximum distance in kilometers.

Returns a list of markets within the radius sorted by distance from the user's location.
