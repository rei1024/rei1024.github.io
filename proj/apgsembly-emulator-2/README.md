# apgsembly-emulator-2

An emulator for APGsembly 2.0

## Development

### Requirements

- `deno`
  - https://deno.land/manual/getting_started/installation
- `npm`
  - Run `$ npm install`

### Usage

- `$ deno task up` Local server
  - access to [http://localhost:1123/](http://localhost:1123/)
- `$ deno task t` Unit tests
- `$ deno task w` Unit tests with file watcher
- `$ deno task lint` Linting
- `$ deno task cy` E2E tests
- `$ deno task bundle` Bundle

### Structure

- `src/` an emulator for APGsembly
- `frontend/` UI of the emulator
- `cypress/` E2E testing
