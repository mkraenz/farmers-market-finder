# Market Finder

## Stories

- [x] As a market owner, I want to add my market to the list, so that I can attract more customers.
- [ ] As a user, I want to find markets near me, so that I can buy fresh produce.
- [ ] As a market owner, I want to upload images of my market, so that I can attract more customers.

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
    "long": 34.56
  },
  "zip": "12345",
  "products": ["Apples", "Oranges", "Bananas"]
}
```

Get all markets -> Endpoint `GET /markets`
Get a market by id -> Endpoint `GET /markets/:id`

### As a user, I want to find markets near me, so that I can buy fresh produce

Get markets near me -> Endpoint `GET /markets?lat=23.45&long=34.56&radius=10&limit=10`
where `lat` and `long` are the user's current location and radius is the maximum distance in kilometers.

Returns a list of markets within the radius sorted by distance from the user's location.

#### Todos

- [ ] Install Postgres PostGIS extension
- [ ] Learn the basics of PostGIS
- [ ] redo `market.location` with PostGIS
- [ ] calculate distance between user and market
- [ ] endpoint to get markets near user

## Migrations

From [TypeORM docs Using CLI](https://orkhan.gitbook.io/typeorm/docs/using-cli)

```sh
# autogenerate migration ./migrations/<timestamp>-mymigration.ts
npm run typeorm:generate-migration --name=mymigration

# run migration
npm run typeorm:run-migrations

# revert migration
npm run typeorm:revert-migration
```

## Handling Geolocation data with PostGIS

### Installing PostGIS manually

Note: This is only for reference since we switched to a postgis docker image.

```sh
# from host
docker exec -it market-finder_db_1 bash
# from within the container
apt update
apt install -y postgis
psql -U $POSTGRES_USER -d $POSTGRES_DB -c 'CREATE EXTENSION IF NOT EXISTS postgis;'
```
