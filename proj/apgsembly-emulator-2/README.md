# apgsembly-emulator-2
An emulator for APGsembly 2.0

## Testing
### Requirements
* `make`
* `deno`
    * https://deno.land/#installation
    * `file_server`
        * https://deno.land/manual@v1.15.3/examples/file_server
* `npm`
    * Run `$ npm install`

### Usage
* `$ make up` Local server
    * access to `http://localhost:1123/`
* `$ make t` Unit tests
* `$ make watch` Unit tests with file watcher
* `$ make lint` Linting
* `$ make cy` E2E tests
