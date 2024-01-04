# =========================================================
# Base image running node and setting the working directory
# =========================================================
FROM node:20.10.0-alpine AS base

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

COPY nx.json nx.json
COPY tsconfig.base.json tsconfig.base.json
COPY apps/ apps/
COPY libs/ libs/

RUN yarn --frozen-lock-file --ignore-scripts
ARG APP_NAME
RUN yarn nx run ${APP_NAME}:build:production
RUN rm -f .npmrc


# ==================================================
# This image is used to actually run our application
# ==================================================
FROM base AS production

RUN apk add --no-cache curl bash

COPY --from=dependencies /home/node/boilerplate/ ./
COPY --from=compiled /home/node/boilerplate/dist/apps ./dist/apps

COPY tsconfig.base.json ./tsconfig.base.json

EXPOSE 3000

ARG APP_NAME
ENV APP_NAME ${APP_NAME}
CMD node dist/apps/${APP_NAME}/main
