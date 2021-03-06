macro(EMS_LOPT str)
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s${str}")
	target_link_options(xsteg2_wasm PRIVATE "-s${str}")
endmacro()

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} --post-js ${CMAKE_CURRENT_SOURCE_DIR}/src/wasm_api.glue.js")

# Generate WebIDL glue code
if(NOT EXISTS $ENV{EMSDK})
    message(FATAL "Unable to find emsdk path")
else()
    message("Cleaning previous WebIDL Glue Code...")
    file(REMOVE src/wasm_api.glue.cpp)
    file(REMOVE src/wasm_api.glue.js)
    message("Result: ${WASM_GLUE_CLEAN_OK}")
    message("Building WebIDL Glue Code...")
    execute_process(
        COMMAND python3 $ENV{EMSDK}/upstream/emscripten/tools/webidl_binder.py idl/wasm_api.idl src/wasm_api.glue
        WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
        RESULT_VARIABLE WASM_GLUE_OK
    )
    message("Result: ${WASM_GLUE_OK}")
endif()

add_custom_target(xsteg2_wasm_glue DEPENDS src/wasm_api.glue.cpp)

add_executable(xsteg2_wasm 
    src/wasm_api.cpp
)

EMS_LOPT(DISABLE_EXCEPTION_CATCHING=0)
EMS_LOPT(ALLOW_MEMORY_GROWTH=1)
EMS_LOPT(SAFE_HEAP=0) #!!! Do not turn SAFE_HEAP on while using custom SIMD implementations
EMS_LOPT(ASSERTIONS=1)
EMS_LOPT(FORCE_FILESYSTEM=1)
EMS_LOPT(ENVIRONMENT=web)
EMS_LOPT(MODULARIZE=1)
EMS_LOPT(EXPORT_NAME=\"XModule\")
EMS_LOPT(EXTRA_EXPORTED_RUNTIME_METHODS=['FS'])
EMS_LOPT(EXPORT_ES6=1)
EMS_LOPT(USE_ES6_IMPORT_META=0)

add_dependencies(xsteg2_wasm xsteg2_wasm_glue)

target_link_libraries(xsteg2_wasm xsteg2)