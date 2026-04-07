cmake_minimum_required(VERSION 3.18.1)

#### PROJECT ####
project(sample)

set(CMAKE_CXX_STANDARD 11)

set(SAMPLE_SRC_DIR "${CMAKE_CURRENT_LIST_DIR}/src")
set(SAMPLE_INC_DIR "${CMAKE_CURRENT_LIST_DIR}/include")

# show build commands
set(CMAKE_VERBOSE_MAKEFILE ON)

# set c++ standard for gcc
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -march=native")
endif()

set(CMAKE_CXX_FLAGS_DEBUG " ${CMAKE_CXX_FLAGS_DEBUG} ${VERBOSE_FLAG} ")

add_executable(
        sample
        ${SAMPLE_SRC_DIR}/Program.cpp
        ${SAMPLE_SRC_DIR}/Arrays.cpp
)

find_library(MATH_LIBRARY m)
if(MATH_LIBRARY)
    target_link_libraries(sample PUBLIC ${MATH_LIBRARY})
endif()