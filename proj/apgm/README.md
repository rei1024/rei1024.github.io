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

## Commit

- `deno task commit "message"`

## Testing

### Requirements

- `deno` above 1.20.1
  - https://deno.land/#installation
  - `file_server`
    - `deno install --allow-net --allow-read -f https://deno.land/std@0.142.0/http/file_server.ts`

### Usage

- `$ deno task up` Local server
  - access to [http://localhost:1618/](http://localhost:1618/)
- `$ deno task t` Unit tests
- `$ deno task w` Unit tests with file watcher
- `$ deno task fmt` Formatting
- `$ deno task bundle` Bundling

## Coverage

### Requirements

- `deno`
- `lcov`
  - https://formulae.brew.sh/formula/lcov

### Usage

- `$ deno task cov` open lcov page
