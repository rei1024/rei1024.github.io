# APGM

APGsembly macro language

## Pipeline

```mermaid
graph TD
    APGM1[APGM + Macro] -->|Expand macro| APGM2[APGM]
    APGM2[APGM] -->|Transpile| APGL1[APGL]
    APGL1[APGL] -->|Optimize sequence| APGL2[APGL]
    APGL2[APGL] -->|Optimize actions| APGL3[APGL]
    APGL3[APGL] -->|Transpile| APGsembly[APGsembly]
```

## Testing

### Requirements

- `make`
- `deno`
  - https://deno.land/#installation
  - `file_server`
    - https://deno.land/manual@v1.15.3/examples/file_server

### Usage

- `$ make up` Local server
  - access to [http://localhost:1618/](http://localhost:1618/)
- `$ make t` Unit tests
- `$ make w` Unit tests with file watcher
- `$ make fmt` Formatting
- `$ make bundle` Bundling

## Coverage

### Requirements

- `make`
- `deno`
- `lcov`
  - https://formulae.brew.sh/formula/lcov

### Usage

- `$ make cov` open lcov page
