FROM  node:22-alpine AS development
WORKDIR /app

ENV TZ=America/Recife
ENV NODE_OPTIONS=--openssl-legacy-provider

COPY --chown=node:node package*.json ./

RUN mkdir node_modules \
    && chown -R node:node node_modules

USER node

RUN yarn install --frozen-lockfile

FROM node:22-alpine AS build

WORKDIR /app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

RUN mkdir -p build && chown -R node:node build

USER node

RUN yarn build

FROM node:20.9.0-alpine AS production

WORKDIR /app

ENV NODE_ENV="production" \
    PORT="3000" \
    TZ="America/Recife"

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/build ./build
COPY --chown=node:node --from=build /app/package.json ./build/package.json

USER node

EXPOSE 3000

CMD ["node", "build/index.js"]
