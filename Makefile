

test: node_modules
	ls */dev/test.js | xargs -n1 node

node_modules:
	npm install --save-dev jsdom chai
	rm package*

clean:
	rm node_modules
