### BUILD ###
FROM node:18-alpine As build

WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .
RUN npm run build
ENV NODE_ENV production
RUN npm prune --omit=dev && npm cache clean --force
USER node

### PRODUCTION ###

FROM node:18-alpine As production

WORKDIR /home/node
ENV NODE_ENV production
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
ENV NODE_ENV production

USER node

CMD npx typeorm migration:run --dataSource ./dist/src/ormconfig.js && node dist/src/main.js
# CMD ["node", "dist/src/main.js"]

# docker run --rm -p 3001:3333 -e FMF_PORT='3333' -e POSTGRES_HOST='172.17.0.1' -e POSTGRES_PORT=5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=test --name nestjs-fargate-test test2:latest
# docker run --rm -p 3001:3333 -e FMF_PORT='3333' -e POSTGRES_HOST='172.17.0.1' -e POSTGRES_PORT=5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=test --name nestjs-fargate-test test2:latest npx typeorm-ts-node-commonjs -- -d ./src/ormconfig.ts