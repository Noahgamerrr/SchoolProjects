FROM node:22-alpine AS base

WORKDIR /app

FROM base as server-deps
COPY package.json package-lock.json /app/
RUN npm ci --only=production

FROM base as client-deps
COPY client/package.json client/package-lock.json /app/client/
WORKDIR /app/client
RUN npm ci

FROM base as build-client
COPY client /app/client
COPY --from=client-deps /app/client/node_modules /app/client/node_modules
WORKDIR /app/client
RUN npm run build

# FROM base as build-server
# COPY --from=server-deps /app/node_modules /app/node_modules
# COPY --from=build-client /app/client/build /app/client/build
# COPY . /app
# RUN npm run build

FROM base as final
COPY --from=server-deps /app/node_modules /app/node_modules
COPY --from=build-client /app/client/node_modules /app/client/node_modules
COPY --from=build-client /app/client/dist /app/client/dist
COPY . /app
USER node
ENV NODE_ENV=production
EXPOSE 8080
CMD ["npm", "start"]

