# test
t:
	deno test --config=deno.jsonc
# test watch
w:
	deno test --watch --config=deno.jsonc
# formatting
fmt:
	deno fmt --config=deno.jsonc
# reload remote dep
reload:
	deno test --reload
# local server
up:
	file_server . -p 1618
# bundling
bundle:
	deno bundle src/integration/mod.ts dist/integraion.js
# coverage
cov:
	deno test --config=deno.jsonc --coverage=coverage
	deno coverage coverage --lcov > coverage.lcov
	genhtml -o coverage/html coverage.lcov
	open coverage/html/index.html