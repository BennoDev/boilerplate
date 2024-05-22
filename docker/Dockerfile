# =========================================================
# Base image running node and setting the working directory
# =========================================================
FROM node:20-slim AS base

WORKDIR /home/node/boilerplate


# ==============================================================
# Base images containing necessary files to install dependencies
# ==============================================================
FROM base AS base-dependencies

COPY package.json ./
COPY yarn.lock ./


# ======================================================
# Image containing the necessary production dependencies
# ======================================================
FROM base-dependencies AS dependencies

RUN yarn --production --frozen-lock-file
RUN rm -f .npmrc


# =========================================
# Compiles our code into a production build
# =========================================
FROM base-dependencies AS compiled

ARG APP_NAME

COPY nx.json nx.json
COPY tsconfig.base.json tsconfig.base.json
COPY eslint.config.js eslint.config.js
COPY jest.preset.js jest.preset.js

COPY apps/${APP_NAME} apps/${APP_NAME}
# We copy all libs as we don't know which ones we need to build the app
COPY libs/ libs/

RUN yarn --frozen-lock-file --ignore-scripts
RUN yarn nx run ${APP_NAME}:build:production
RUN rm -f .npmrc


# ==================================================
# This image is used to actually run our application
# ==================================================
FROM base AS production

ARG APP_NAME

COPY --from=dependencies /home/node/boilerplate/ ./
COPY --from=compiled /home/node/boilerplate/dist/apps/${APP_NAME} ./dist/apps/${APP_NAME}

# COPY tsconfig.base.json ./tsconfig.base.json

EXPOSE 3000

ENV APP_NAME ${APP_NAME}
CMD node dist/apps/${APP_NAME}/main
