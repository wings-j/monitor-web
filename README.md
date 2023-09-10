# monitor-web

Web monitor for exceptions, requests and analysis.

# Features

- Supervise web exceptions.
- Supervise web request with `XMLHttpRequest` and `fetch`.
- Analyze web performance by [Web Vitals](https://www.npmjs.com/package/web-vitals).
- Send log to server.

# Install

```
npm install @wings-j/monitor-web
```

# Usage

```
import { initiate } from '@wings-j/monitor-web'

const monitor = initiate('http://localhost:5500', {}) // The argument is the log server address and options.
```

# Options

The second argument of the `initiate` function is an object includes:

| Name        | Type               | Description                      |
| ----------- | ------------------ | -------------------------------- |
| application | string             | Application Name                 |
| headers     | Object             | Headers of log request to server |
| meta        | Object or Function | Extra data                       |
