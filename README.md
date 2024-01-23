# NestJS / Nx Boilerplate

## Git Hooks

The source code for the git hooks is stored in the `.husky` folder, with a filename that represents the hook, like `pre-commit` or `post-update`.

### Installation / Updating

To install or update your Git hooks, please run `yarn prepare`.

## Runtime Version Management

We manage our runtime versions with [nvm](https://github.com/nvm-sh/nvm), make sure to have this installed.

To install the node version used in the current directory, just run `nvm install` in the root of the repo. To then switch to this version, run `nvm use`.
Verify that the version in the `.nvmrc` is correctly installed by running `node -v`.

## Docker

We use [Docker](https://www.docker.com/) to run our dependencies, such as postgres, in a predictable and easy to set-up way.

### Configuring the containers

Next, we need to provide the configuration for docker compose, as well as for each container we wish to run.
In the `docker` folder in the root of the project we can see a few things:

```sh
.env.example # This file describes the config for docker compose itself
.env.postgres.example # This file describes the config for the postgres container
.env.${container-name}.example # This file describes the config for the ${container-name} container
docker-compose.yml # The compose file that will run our setup
```

Make a copy of each `env.example` and `.env.*.example` file without the `.example` postfix, in the example above it would be `.env, .env.postgres, .env.${container-name}`.
In most cases just copying these files across will do the trick, since they already contain values that will work for a local setup. However should the container
need to be configured with any secrets that are not suitable to VCS, fill in the proper value in the copied file.

### Running the containers

In order to boot up or stop the containers, we have the following scripts:

```sh
$ yarn docker:start # If the containers don't exist yet, they will be created the first time this command is run.
$ yarn docker:stop # Stops the containers, all data stored in for example a postgres container will not be erased when using this command.
```

In the case of our postgres DB, it will be created the first time we boot up our containers.

### Creating a Docker container for an app

This boilerplate includes a Dockerfile that can be reused for each app. To create a Docker container for an app & run it, execute the following commands:

```sh
# To build the container
$ docker build -f './docker/Dockerfile' --build-arg APP_NAME=api --progress=plain -t boilerplate/api .

# TO run the container in the same network as the dependencies
$ docker run --name api_boilerplate --network boilerplate_default --env-file './apps/api/.env.docker' -p '3001:3001' boilerplate/api
```

To build the container for for a different app, just change the APP_NAME argument to the name of the app you want to build.

### Removing a container

In order to remove a container, you'll need to find out it's name or docker id.
The name is easy to find given we determine it ourselves, in the `docker/docker-compose.yml` we can see that our database container is named `pgsql_${COMPOSE_PROJECT_NAME}`
and by reading our `docker/.env` or `docker/.env.example` file, we can determine the full name is `pgsql_boilerplate`.

To remove the container, just run the following command:

```sh
$ docker rm pgsql_boilerplate
```

### Useful commands

If you wish to verify your containers are running, you can either run the CLI command `docker ps` or check the desktop GUI.
In case it's not running, you can manually call the docker compose command, or temporarily remove the `-d` from the yarn scripts in the package json
to see more information about what is going wrong on startup.

For further container management use either the Docker desktop GUI, or better yet, check out the [Docker CLI](https://docs.docker.com/engine/reference/commandline/cli/).

## Database

Make sure that you followed the Docker instructions before continuing here.
The database will be automatically created when the containers spins up.

### Configuring the Mikro-ORM CLI

For our database access, we are using [Mikro ORM](https://mikro-orm.io/)

In order to properly configure the Mikro-ORM CLI, copy the `.env.example` to a `.env` in the data directory.

### Database setup

In order to initially migrate and seed the database, we have provided the following commands:

```sh
# Runs the existing migrations
$ yarn db:migrate

# Runs the database seeds
$ yarn db:seed
```

A list of all database related scripts in the package.json:

```sh
# General
# Drop the entire database
$ yarn db:drop

# Drop and migrate
$ yarn db:rollup


# Migrations
# Generate a migration based on the diff between the database and current code models
$ yarn db:migrate:generate # This will ask you for a file name, use kebab case here!

# Creates an empty new migration
$ yarn db:migrate:create

# Apply all migrations
$ yarn db:migrate

# Revert the latest migration
$ yarn db:migrate:revert


# Seeders
# Creates a new empty seeder
$ yarn db:seed:create

# Run all seeders
$ yarn db:seed
```

## Developing locally

To install our dependencies and develop locally, we'll need to have [yarn](https://yarnpkg.com/) installed.
Follow the instructions [here](https://yarnpkg.com/getting-started/install) to do so. After that we can run `yarn` to install our dependencies.

In order to develop locally we need all of the docker containers to be running, as per the instructions above.
The database schema also needs to be up to date which we do by running `yarn db:migrate`.

We also need to make sure each app is currently configured with a `.env` file. Each app has it's own `.env.example` file which
needs to be copied, renamed to `.env` and filled in properly in order to run the app.

This monorepo is managed by [Nx](https://nx.dev/) so we use the Nx CLI to run it. Reading the following pages will help understand how to work with Nx:

-   [Using the Nx CLI](https://nx.dev/using-nx/nx-cli)
-   [Using Nx Affected](https://nx.dev/using-nx/affected)
-   [Using Nx Nest Plugin](https://nx.dev/packages/nest)

A full list of CLI commands can be found in the bottom left of the linked pages under the API / Reference -> CLI.

```sh
# Builds and runs one of the application
$ yarn nx serve ${optionalAppName}

# Aliases
$ yarn start ${optionalAppName} # An alias defined by default in our package.json
$ yarn nx run api:serve # Alternative way to invoke targets (https://nx.dev/cli/run) - name is required here

# ${optionalAppName} is used to specify which app to run, if not given it will default to what is defined as the
# root application in our nest-cli.json. In our case this is the api.
# To run another app, like a theoretical app named "worker", we would use `yarn nx serve worker` or `yarn start worker`.
```

If you want to just build the app, you can use the following commands:

```sh
$ yarn build

# Aliases
$ yarn nx build api
$ yarn nx run api:build
```

### Debugging locally

Nx helps us by setting up a debugger for us, which we can very easily attach to by running our `yarn start` commands in a JavaScript Debugger Terminal.
To do this in VSCode just open a terminal window, but instead of opening it with `bash` or `zsh`, use the Debugger Terminal.
You can read how to open one [here](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_javascript-debug-terminal).

### Running tests

As a test runner we use jest. To run the tests locally just use `yarn test`.
If you want to narrow which tests you're running, you can supply a name which will be used to filter by.
For example, to only test the core lib we can run command like this: `yarn test core`.
To test a specific file in the api app, we can run `yarn test api app --testFile hash.service`.
To run tests for all applications and libraries, we can use `yarn test:all`

### Running linting and formatting

Nx also helps us run our linting and formatting for our changed files.
We can run linting commands in the following ways:

```sh
# Run the linting for a specific app
yarn lint api

# Aliases
yarn nx lint api
yarn nx run api:lint

# Run the formatting for a specific app
yarn nx format:write api

# Run the linting for all apps
yarn lint:all
```

### Using affected

Make sure to read the [docs](https://nx.dev/using-nx/affected) to understand affected.

If we just want to serve, lint, test, ... only applications that had any changes compared to master, we can use affected with the other commands.

```sh
# Serves all affected apps
yarn nx affected --target=serve

# Lints all affected apps
yarn nx affected --target=lint

# Formats all affected apps
yarn nx affected --target=format:write

# Tests all affected apps
yarn nx affected --target=test
```

### Extensions

This repository contains an extensions folder, which contains a few extensions that are useful for developing. While most are advised, they are also optional, and are related to formatting, syntax highlighting or linting.

However, the [Jest Runner](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner) is extremely useful to be able to conveniently test individual suites, describe blocks or tests.
