FROM node:18

ENV NODE_ENV production
# Note: for production use, we should use a multi-stage build to get rid of non-production dependencies and use a smaller base image
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
# npm run build currently fails with sh: 1: nest: not found - somehow nest cli doesnt seem to be installed
RUN npm run build

CMD [ "node", "dist/src/main.js" ]