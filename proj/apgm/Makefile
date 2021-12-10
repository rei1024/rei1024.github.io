t:
	deno test
w:
	deno test --watch
fmt:
	deno fmt --options-indent-width=4 --ignore=dist/integraion.js
reload:
	deno test --reload
up:
	file_server . -p 1618
bundle:
	deno bundle src/integration/mod.ts dist/integraion.js