EMSCRIPTEN_ENV := $(shell command -v emmake 2> /dev/null)

2.1.0.tar.gz:
	wget https://github.com/libjpeg-turbo/libjpeg-turbo/archive/refs/tags/2.1.0.tar.gz
libjpeg-turbo-2.1.0: 2.1.0.tar.gz
	tar xzvf 2.1.0.tar.gz
# | means libjpeg-turbo-2.1.0 is a "order-only prerequisite" so creating the file doesn't invalidate the dir
libjpeg-turbo-2.1.0/libturbojpeg.a: | libjpeg-turbo-2.1.0
ifndef EMSCRIPTEN_ENV
	$(error "emmake is not available, activate the emscripten env first")
endif
	cd libjpeg-turbo-2.1.0; emcmake cmake -G"Unix Makefiles" -DWITH_SIMD=0 -DCMAKE_BUILD_TYPE=Release -Wno-dev
	cd libjpeg-turbo-2.1.0; emmake make

COMMON_FLAGS = -s USE_SDL=2\
	-s USE_LIBPNG=1\

CFLAGS = $(COMMON_FLAGS)\
	-Duuid_generate_random=uuid_generate\
	-std=c++11\
	-Wall\
	-Werror\
	-Wold-style-cast\
	-DES_GLES\
	-DES_NO_THREADS\
	-gsource-map\
	-I libjpeg-turbo-2.1.0\

CPPS := $(shell ls endless-sky/source/*.cpp) $(shell ls endless-sky/source/text/*.cpp)
CPPS_EXCEPT_MAIN := $(shell ls endless-sky/source/*.cpp | grep -v main.cpp) $(shell ls endless-sky/source/text/*.cpp)
TEMP := $(subst endless-sky/source/,build/emcc/,$(CPPS))
#OBJS := $(subst .cpp,.o,$(TEMP))
OBJS := build/emcc/Point.o build/emcc/Random.o build/emcc/Angle.o build/emcc/DataNode.o build/emcc/Files.o build/emcc/File.o build/emcc/DataFile.o build/emcc/text/Utf8.o
TEMP := $(subst endless-sky/source/,build/emcc/,$(CPPS_EXCEPT_MAIN))
#OBJS_EXCEPT_MAIN := $(subst .cpp,.o,$(TEMP))
OBJS_EXCEPT_MAIN := $(OBJS)
HEADERS := $(shell ls endless-sky/source/*.h*) $(shell ls endless-sky/source/text/*.h*) libjpeg-turbo-2.1.0/libturbojpeg.a

build/emcc/%.o: endless-sky/source/%.cpp
ifndef EMSCRIPTEN_ENV
	$(error "emmake is not available, activate the emscripten env first")
endif
	@mkdir -p build/emcc
	em++ $(CFLAGS) -c $< -o $@

build/emcc/text/%.o: endless-sky/source/text/%.cpp
ifndef EMSCRIPTEN_ENV
	$(error "emmake is not available, activate the emscripten env first")
endif
	@mkdir -p build/emcc/text
	em++ $(CFLAGS) -c $< -o $@

build/emcc/datanode-factory.o: endless-sky/tests/src/helpers/datanode-factory.cpp
ifndef EMSCRIPTEN_ENV
	$(error "emmake is not available, activate the emscripten env first")
endif
	@mkdir -p build/emcc
	em++ $(CFLAGS) -c endless-sky/tests/src/helpers/datanode-factory.cpp -I endless-sky/tests/include -o build/emcc/datanode-factory.o

patch: patch.diff
	# patch.diff should correspond to https://github.com/thomasballinger/endless-web/compare/master...browser-support
	# but some files can be removed from the patch
	cd endless-sky; git clean -dxf
	cd endless-sky; git apply --whitespace=nowarn ../patch.diff

WEB_AND_NODE_FLAGS = -s EXPORT_ES6=1\
		--bind\
		--no-entry\
		lib.cpp\
		build/emcc/datanode-factory.o\
		-L libjpeg-turbo-2.1.0\
		-l jpeg\
		${COMMON_FLAGS}\
		$(OBJS_EXCEPT_MAIN)\
		-s LLD_REPORT_UNDEFINED\

lib-web.mjs lib-web.wasm: $(OBJS) lib.cpp build/emcc/datanode-factory.o libjpeg-turbo-2.1.0
	em++ $(WEB_AND_NODE_FLAGS) -o lib-web.mjs

lib-node.mjs lib-node.wasm: $(OBJS) lib.cpp build/emcc/datanode-factory.o libjpeg-turbo-2.1.0
	em++ $(WEB_AND_NODE_FLAGS) --pre-js pre_js.js -o lib-node.mjs
	./post_compile_mjs lib-node.mjs

web: demo.html lib-web.mjs
	emrun --serve_after_close --serve_after_exit --browser chrome --private_browsing demo.html

node: demo.mjs lib-node.mjs
	node demo.mjs

clean:
	rm -rf lib-web.mjs lib-web.wasm lib-node.mjs lib-node.wasm
