# apgsembly-emulator-2

An emulator for APGsembly 2.0

## Development

### Requirements

- `deno`
  - Above v2.0
  - https://docs.deno.com/runtime/getting_started/installation/
- `npm`
  - Run `$ npm install`

### Usage

- `$ deno task up` Local server
  - access to [http://localhost:1123/](http://localhost:1123/)
- `$ deno task t` Unit tests
- `$ deno task w` Unit tests with file watcher
- `$ deno task lint` Linting
- `$ deno task e2e` E2E tests
- `$ deno task bundle` Bundle

### Structure

- `src/` an emulator for APGsembly
- `test/` unit tests
- `frontend/` UI of the emulator
- `e2e/` E2E testing
