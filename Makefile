

test: node_modules
	ls */dev/test.js | xargs -n1 node

node_modules:
	npm install --no-save jsdom chai

clean:
	rm -rf node_modules
