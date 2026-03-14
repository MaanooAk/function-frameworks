
FF := function-frameworks.js

NAMES := \
	template_inflate \
	binds_update \
	lists_update \
	start_updater \
	canvas_loop \
	storage_sync \
	element_classes \
	safe_guard \

LIBS := $(NAMES:%=lib/%.js)

vpath %.js $(NAMES)

default: $(FF)

$(FF): $(LIBS)
	cat $^ > $@
	cp $@ lib/

lib/%.js: %.js lib | %.test
	cat $< | grep -v '^export' > $@

%.test: %
	ls $</dev/test.js | xargs -n1 -P0 node

test: node_modules */*.js */dev/*.js
	ls */dev/test.js | xargs -n1 -P0 node

lib:
	mkdir -p lib

node_modules:
	npm install --no-save jsdom chai

clean:
	rm -rf $(FF) lib test
	#rm -rf node_modules
