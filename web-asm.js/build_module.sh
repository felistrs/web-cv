em++   -std=c++14  -O3 -Oz -Os   -v -o   js/surfModule.js   -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_FUNCTIONS="['_main']" --bind -s NO_EXIT_RUNTIME=1   -Isrc ../dlib/dlib/all/source.cpp   -I../dlib/    -DDLIB_NO_GUI_SUPPORT      src/surfLibrary.cpp

mv ./js/surfModule.js.mem ./

