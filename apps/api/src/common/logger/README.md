# Logger

Structured logger backed by Pino.

- Writes to a rotating file in `apps/api/logs/`.
- Also prints colorized and formatted output to stdout/console when `NODE_ENV !== 'production'`.

## Usage

Inject via `LOGGER_SERVICE` and call through the `LoggerService` interface:

```ts
import { Inject } from '@nestjs/common';
import { LOGGER_SERVICE, LoggerService } from 'src/common/logger/logger.service.contract';

constructor(@Inject(LOGGER_SERVICE) private readonly logger: LoggerService) {}
```

```ts
this.logger.info('researcher fetched', { researcherId: id });
this.logger.error('database query failed', { error: err.message });
```

The second argument is an optional `Record<string, unknown>` for structured context.

## Stack and architecture

- **Core:** [`pino`](https://getpino.io/).
- **File transport:** [`pino-roll`](https://github.com/mcollina/pino-roll) — daily rotation + 10 MB cap, writes to `apps/api/logs/` (included in .gitignore).
- **Console transport:** [`pino-pretty`](https://github.com/pinojs/pino-pretty) — colorized output to stdout/console, disabled in production.
- Both transports run in parallel via `pino.multistream`.
- Minimum log level is `debug`, meaning all logs of level `debug` and above (info, warn, error) are captured in both file and console (except in production, where console is disabled).
- `LoggerModule` is `@Global()`, imported once in `AppModule`.
