cmake_minimum_required(VERSION 3.18.1)

#### PROJECT ####
project(samples)

set(CMAKE_C_STANDARD 11)

set(SAMPLE_SRC_DIR "${CMAKE_CURRENT_LIST_DIR}/src")
set(SAMPLE_INC_DIR "${CMAKE_CURRENT_LIST_DIR}/include")

# show build commands
set(CMAKE_VERBOSE_MAKEFILE ON)

# set c++ standard for gcc
if(CMAKE_C_COMPILER_ID MATCHES "GNU|Clang")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -std=c11 -march=native")
endif()

set(CMAKE_C_FLAGS_DEBUG " ${CMAKE_C_FLAGS_DEBUG} ${VERBOSE_FLAG} ")

add_executable(
        arrays
        ${SAMPLE_SRC_DIR}/Arrays.c
)

add_executable(
        doublylinkedlists
        ${SAMPLE_SRC_DIR}/DoublyLinkedLists.c
)

add_executable(
        graphs
        ${SAMPLE_SRC_DIR}/Graphs.c
)

add_executable(
        plot
        ${SAMPLE_SRC_DIR}/Plot.c
)

add_executable(
        primitives
        ${SAMPLE_SRC_DIR}/Primitives.c
)

add_executable(
        trees
        ${SAMPLE_SRC_DIR}/Trees.c
)

find_library(MATH_LIBRARY m)
if(MATH_LIBRARY)
    target_link_libraries(sample PUBLIC ${MATH_LIBRARY})
endif()