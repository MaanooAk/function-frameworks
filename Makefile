
FF := function-frameworks

default: test $(FF).js

$(FF).js: */*.js
	cat */*.js | grep -v '^export' > $(FF).js

test: node_modules */*.js */dev/*.js
	ls */dev/test.js | xargs -n1 node

node_modules:
	npm install --no-save jsdom chai

clean:
	rm -rf $(FF).js
	rm -rf node_modules
