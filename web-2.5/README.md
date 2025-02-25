# Web2.5 Game Node Template

This documentation provides a basic overview of the template. Each module has its own `README` file with more detailed information.

Full functionality of this template (namely `npm run post` mentioned below) is dependant on the `batcher` that was copied to your system during the template creation process. Please, look at the instructions in that folder first to get it running.

## Installation

To install dependencies and perform initial setup, run the following command:

```
npm run initialize
```

This does the following:

- install dependencies of this template
- copies `.env.example` as `.env.development` to the parent folder

### MacOS specific

If you're using Mac and run into installation issues you can add `--target=esbuild-darwin-arm64` as a workaround to `npm install`. This installs the correct version of a problematic package. For example:

```
npm install --save-dev esbuild@latest --target=esbuild-darwin-arm64
```

## Building

To compile the Game Node into `endpoints` and `gameCode` entrypoints used by Paima Engine, use the following command:

```
npm run pack
```

To compile the JavaScript Bundle of the middleware for the game frontend, run the command:

```
npm run pack:middleware
```

## Prerequisites

Ensure that the `paima-engine-{linux|mac}` executable is located in the parent directory of this project. The directory structure should be as follows:

```
this-template
../paima-engine-linux
../.env
```

We're also using `batcher` that has it's own configuration and should be deployed as a separate service.

## Environment Setup

Config file `.env.development` is created during `npm run initialize` in the parent folder, based on `.env.example` in this project. This is an empty file that you need to fill in with your specific values, before running Paima Engine.

Feel free to use examples written in the file for initial testing.

## Development

To reflect changes in the `API`, use the following command to regenerate all `tsoa` routes:

```
npm run compile:api
```

If there are any changes to the DB schema or queries, start the `pgtyped` watcher process using the following command. It will regenerate all the DB types used in the project:

```
npm run compile:db
```

To speed up the development cycle you can at any time completely reset the database and start syncing from the latest blockheight. Run this command, that will modify your `.env.development` and `docker-compose.yml` files:

```
npm run database:reset
```

To utilize the batcher self signing endpoint you can send appropriate data through this command:

```
npm run post -- <wallet> <xpGain>
```

This should be utilized for admin-like inputs originating from your server, not from players. These inputs are not validated and you should discard them in your state transition function if they are not posted by the batcher's wallet.

The command is just a shortcut to well formed `POST` request. For testing purposes you can achieve the same goal with a tool you're used to such as `Postman` for example.

## Production

To start the database, run the command:

```
npm run database:up
```

To run the Game Node, follow these steps:

1. Change to the parent directory where the packaged folder was generated:

```
cd ..
```

2. Execute the following command:

```
./paima-engine-linux run
```

You can set the `NODE_ENV` variable if you want to load a custom config for your Game Node. For example to load `.env.devnet` use:

```
NODE_ENV=devnet ./paima-engine-linux run
```

## Documentation

If you've got this far you're probably already familiar with our documentation. But if you need to refresh your knowledge you can copy the documentation files to your file system by using the standalone CLI command:

```
./paima-engine-linux docs
```

Or you can visit our [Paima Documentation Website](docs.paimastudios.com) at any time.
