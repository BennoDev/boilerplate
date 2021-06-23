# Boilerplate

Monorepo for NestJS projects.

## Overview

### Folder structure

```
|-- apps
    |-- api
    |-- worker
    |-- ... other apps
|-- data
    |-- cache # Mikro-ORM metadata cache
    |-- migrations
        |-- Migration20210618212853.ts
    |-- seeds-dev
        |-- Migration20210618202117.ts
        |-- users.json # User data to seed the database
        |-- ... data seeding migration files and accompanying json data for dev environment
    |-- seeds-stag
        |-- ... data seeding migration files and accompanying json data for stag environment
    |-- seeds-prod
        |-- ... data seeding migration files and accompanying json data for prod environment
    |-- .env.example
    |-- data.config.ts # Mikro-ORM CLI configuration, for executing migrations, data seeding, ...
    |-- data.utils.ts # Data migration / seeding related utilities
|-- docker
    |-- volumes
        |-- postgres
        |-- redis
    |-- .env.example
    |-- .env.postgres.example
    |-- docker-compose.yml
|-- libs
    |-- common # Not a NestJS module, contains utils, types, constants and other potential cross-cutting concerns
    |-- logger # Powerful structured logging with Pino
    |-- models # Domain models + database access via Mikro-ORM
    |-- testing # Not a NestJS module, you can put functions, mocks, anything related to testing that is necessary in more than 1 app in this lib
    |-- ... other libs
|-- .editorconfig
|-- .eslintignore
|-- .eslintrc.js
|-- .gitignore
|-- .nvmrc
|-- .prettierrc
|-- nest-cli.json
|-- package.json
|-- README.md
|-- tsconfig.build.json
|-- tsconfig.json
|-- yarn.lock
```

## Getting started

### Prerequisites

-   [Node](https://nodejs.org/en/)
-   [NVM](https://github.com/nvm-sh/nvm)
-   [Docker](https://www.docker.com/products/docker-desktop)

### Project dependencies

```bash
# We use yarn for this project
$ npm i yarn -g

# NestJS CLI is used to generate new apps and libraries
$ npm i @nestjs/cli -g

# Install project dependencies
$ yarn
```

### NVM

After installing NVM, make sure you are running the proper version of node using the following instructions.

```bash
# This will switch active node versions to the one defined in the .nvmrc file, in the root.
$ nvm use

# If that version is not installed, NVM will instruct you to install the correct version.
$ nvm install 12.18.3 # example

# After this, you can use `nvm use` again, and it will work properly.
```

### Docker setup

```bash
# Create and run the container - this will also create our database
$ yarn docker:start
```

### Database setup

We use a Postgres instance for our database.

Before being able to migrate or seed the database, we'll need to fill in the `.env.example` file inside the data folder.
Create a new `.env.local` file next to it, and fill in the values. The example file will contain correct values for our local environment.

```bash
# Run the existing migrations
$ yarn db:migrate

# Seed the database with initial values
$ yarn db:seed
```

### Running the applications

Before running the applications, every application needs to have a filled in `.env.local`.
See each applications `.env.example` for their respective required values.

```bash
# Run the main application (my-gateway)
$ yarn start
# OR for watch mode
$ yarn start:dev
```

## Scripts

### Building and running

```bash
# Removes previous build and create new one
$ yarn build

# For all start commands: append name of project you want to start, defaults to the main app defined in nest-cli.json

# Start application (builds if needed)
$ yarn start

# Start application in watch mode
$ yarn start:dev

# Start application in debug mode
$ yarn start:debug

# Start application in prod mode - separate for different apps
$ yarn start:prod
```

### Database

```bash
# General
# Drop the entire database
$ yarn db:drop

# Drop and migrate
$ yarn db:rollup


# Migrations
# Generate a migration based on current models
$ yarn db:migrate:generate -n <NameOfMigration>

# Apply all migrations
$ yarn db:migrate

# Revert the latest migration
$ yarn db:migrate:revert


# Seeds
# Create a new empty dev seed
$ yarn db:seed:generate -n <NameOfSeed>

# Apply dev seeds
$ yarn db:seed

# Revert the latest dev seed
$ yarn db:seed:revert

# Commands exist for production seeds aswell
$ yarn db:seed:prod:generate -n <NameOfSeed>
$ yarn db:seed:prod
$ yarn db:seed:prod:revert

# Convenience command to execute all seeds
$ yarn db:seed:all
```

See [Mikro ORM](https://mikro-orm.io/docs/installation/) docs for more possible commands

### Formatting + linting

```bash
# Check codebase for formatting errors
$ yarn format:check

# Format codebase
$ yarn format:fix

# Check codebase for linting errors
$ yarn lint
```

### Docker

```bash
# Start (and create if necessary) docker containers
$ yarn docker:start

# Stop running containers
$ yarn docker:stop
```

### Testing

```bash
# Run tests
$ yarn test

# Append name of files or module you want to test, for example:
$ yarn test login
$ yarn test auth
$ ...
```

### Adding apps or libraries

```bash
# Adds a new library (will add necessary code to nest-cli.json, package.json & tsconfig.json)
$ nest g lib <NameOfLibrary>
# Example for logger: nest g lib logger

# Adds a new application (will add necessary code to nest-cli.json, package.json & tsconfig.json)
$ nest g app <NameOfApplication>
```
