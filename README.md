# politiCCCs backend

This contains the server which provides data to the [frontend](https://github.com/politicccs/frontend) via an API endpoint `/api/`

Additionally, when in production it serves the frontend on `/`.

## Development

First, install all the dependencies:

```shell
npn install
```

To run the server:

```shell
npm start
```

To run the server in production:

```shell
NODE_ENV=production npm start
```
