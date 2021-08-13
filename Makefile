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
OBJS := $(subst .cpp,.o,$(TEMP))
TEMP := $(subst endless-sky/source/,build/emcc/,$(CPPS_EXCEPT_MAIN))
OBJS_EXCEPT_MAIN := $(subst .cpp,.o,$(TEMP))
HEADERS := $(shell ls endless-sky/source/*.h*) $(shell ls endless-sky/source/text/*.h*) libjpeg-turbo-2.1.0/libturbojpeg.a

build/emcc/%.o: endless-sky/source/%.cpp
	@mkdir -p build/emcc
	em++ $(CFLAGS) -c $< -o $@

build/emcc/%.o: endless-sky/source/%.cpp
	@mkdir -p build/emcc
	em++ $(CFLAGS) -c $< -o $@

build/emcc/datanode-factory.o: tests/src/helpers/datanode-factory.cpp
	@mkdir -p build/emcc
	@mkdir -p build/emcc/text
	em++ $(CFLAGS) -c tests/src/helpers/datanode-factory.cpp -I tests/include -o build/emcc/datanode-factory.o

patch: patch.diff
	# patch.diff should correspond to https://github.com/thomasballinger/endless-web/compare/master...browser-support
	# but some files can be removed from the patch
	cd endless-sky; git clean -dxf
	cd endless-sky; git apply --whitespace=nowarn ../patch.diff

lib/embind/lib.js lib/embind/lib.wasm: $(OBJS) lib.cpp build/emcc/datanode-factory.o libjpeg-turbo-2.1.0
	@mkdir -p lib/embind
	emcc -s MODULARIZE=1 -s 'EXPORT_NAME="createMyModule"' -s --bind -o lib/embind/lib.js $(OBJS_EXCEPT_MAIN) lib.cpp build/emcc/datanode-factory.o

demo: demo.html lib/embind/lib.js
	emrun --serve_after_close --serve_after_exit --browser chrome --private_browsing demo.html

