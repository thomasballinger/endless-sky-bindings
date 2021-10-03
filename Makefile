# This Makefile builds Emscripten outputs dist/lib-web.js and dist/lib-node.js

EMSCRIPTEN_ENV := $(shell command -v emmake 2> /dev/null)
CXX := $(shell command -v ccache 2> /dev/null > /dev/null && echo ccache em++ || echo em++)

all: src/lib-web.js src/lib-node.js
test: node web
2.1.0.tar.gz:
	wget https://github.com/libjpeg-turbo/libjpeg-turbo/archive/refs/tags/2.1.0.tar.gz
libjpeg-turbo-2.1.0: 2.1.0.tar.gz
	tar xzvf 2.1.0.tar.gz
# workaround for https://github.com/emscripten-core/emscripten/issues/13551
libjpeg-turbo-2.1.0/package.json:
	echo '{ "type": "commonjs" }' > $@
# | means libjpeg-turbo-2.1.0 is a "order-only prerequisite" so creating the file doesn't invalidate the dir
libjpeg-turbo-2.1.0/libturbojpeg.a: | libjpeg-turbo-2.1.0 libjpeg-turbo-2.1.0/package.json
libjpeg-turbo-2.1.0/libturbojpeg.a: | libjpeg-turbo-2.1.0 libjpeg-turbo-2.1.0/package.json
ifndef EMSCRIPTEN_ENV
	$(error "emmake is not available, activate the emscripten env first")
endif
	cd libjpeg-turbo-2.1.0; emcmake cmake -G"Unix Makefiles" -DWITH_SIMD=0 -DCMAKE_BUILD_TYPE=Release -Wno-dev
	cd libjpeg-turbo-2.1.0; emmake $(MAKE)

COMMON_FLAGS = -s USE_SDL=2\
	-s USE_LIBPNG=1\

CFLAGS = $(COMMON_FLAGS)\
	-Duuid_generate_random=uuid_generate\
	-std=c++17\
	-Wall\
	-Werror\
	-Wold-style-cast\
	-DES_GLES\
	-DES_NO_THREADS\
	-DES_NODE_BINDINGS\
	-g\
	-I libjpeg-turbo-2.1.0\

CPPS := $(shell ls endless-sky/source/*.cpp) $(shell ls endless-sky/source/text/*.cpp)
CPPS_EXCEPT_MAIN := $(shell ls endless-sky/source/*.cpp | grep -v main.cpp) $(shell ls endless-sky/source/text/*.cpp)
TEMP := $(subst endless-sky/source/,build/emcc/,$(CPPS))
OBJS := $(subst .cpp,.o,$(TEMP))
TEMP := $(subst endless-sky/source/,build/emcc/,$(CPPS_EXCEPT_MAIN))
OBJS_EXCEPT_MAIN := $(subst .cpp,.o,$(TEMP))
HEADERS := $(shell ls endless-sky/source/*.h*) $(shell ls endless-sky/source/text/*.h*) libjpeg-turbo-2.1.0/libturbojpeg.a

build/emcc/%.o: endless-sky/source/%.cpp libjpeg-turbo-2.1.0/libturbojpeg.a
ifndef EMSCRIPTEN_ENV
	$(error "emmake is not available, activate the emscripten env first")
endif
	@mkdir -p build/emcc/text
	$(CXX) $(CFLAGS) -c $< -o $@

build/emcc/text/%.o: endless-sky/source/text/%.cpp
ifndef EMSCRIPTEN_ENV
	$(error "emmake is not available, activate the emscripten env first")
endif
	@mkdir -p build/emcc/text
	$(CXX) $(CFLAGS) -c $< -o $@

build/emcc/datanode-factory.o: endless-sky/tests/src/helpers/datanode-factory.cpp
ifndef EMSCRIPTEN_ENV
	$(error "emmake is not available, activate the emscripten env first")
endif
	@mkdir -p build/emcc
	$(CXX) $(CFLAGS) -c endless-sky/tests/src/helpers/datanode-factory.cpp -I endless-sky/tests/include -o build/emcc/datanode-factory.o

patch: patch.diff
	# patch.diff should correspond to https://github.com/thomasballinger/endless-web/compare/master...browser-support
	# but some files can be removed from the patch
	cd endless-sky; git clean -dxf; git stash
	cd endless-sky; git apply --whitespace=nowarn ../patch.diff

LINKER_FLAGS = -s EXPORT_ES6=1\
		--bind\
		--no-entry\
		lib.cpp\
		build/emcc/datanode-factory.o\
		-L libjpeg-turbo-2.1.0\
		-l jpeg\
		${COMMON_FLAGS}\
		$(OBJS_EXCEPT_MAIN)\
		-s LLD_REPORT_UNDEFINED\
		-s NO_DISABLE_EXCEPTION_CATCHING\
		-s ALLOW_MEMORY_GROWTH=1\
		-gsource-map\

# The browser bundles data with it!
BROWSER_LINKER_FLAGS = --preload-file endless-sky/data@data\
		--preload-file empty@images\
		--preload-file empty@sounds\
		--preload-file empty@saves\
		--preload-file endless-sky/credits.txt@credits.txt\

# Node does not have data bundled with it, you need to point it at some resources
# Node's NODERAWFS doesn't work yet for listing directories, so manually mount for now.
NODE_LINKER_FLAGS = --pre-js pre_js.js\
	-s NODERAWFS=1\
	#-l nodefs.js\

empty:
	mkdir -p empty
	touch empty/empty

src/lib-web.js src/lib-web.wasm src/lib-web.data: $(OBJS) $(HEADERS) lib.cpp build/emcc/datanode-factory.o libjpeg-turbo-2.1.0 empty
	$(CXX) $(LINKER_FLAGS) $(BROWSER_LINKER_FLAGS) -o src/lib-web.js

src/lib-node.js src/lib-node.wasm: $(OBJS) $(HEADERS) lib.cpp build/emcc/datanode-factory.o libjpeg-turbo-2.1.0
	$(CXX) $(LINKER_FLAGS) $(NODE_LINKER_FLAGS) -o src/lib-node.js
	./post_compile_js src/lib-node.js

dist/lib-web.js dist/lib-web.wasm dist/lib-web.data: src/lib-web.js src/lib-web.wasm src/lib-web.data
	cp src/lib-web.js src/lib-web.wasm src/lib-web.data dist

dist/lib-node.js dist/lib-node.wasm: src/lib-node.js src/lib-node.wasm
	cp src/lib-node.js src/lib-node.wasm dist

clean-some:
	rm -rf lib-web.js lib-web.wasm src/lib-node.js src/lib-node.wasm

clean: clean-some
	rm -rf build
