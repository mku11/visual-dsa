cmake_minimum_required(VERSION 3.18.1)

#### PROJECT ####
project(samples)

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
        arrays
        ${SAMPLE_SRC_DIR}/Arrays.cpp
)

add_executable(
        doublylinkedlists
        ${SAMPLE_SRC_DIR}/DoublyLinkedLists.cpp
)


add_executable(
        graphs
        ${SAMPLE_SRC_DIR}/Graphs.cpp
)

add_executable(
        graphmapnodes
        ${SAMPLE_SRC_DIR}/GraphMapNodes.cpp
)

add_executable(
        plot
        ${SAMPLE_SRC_DIR}/Plot.cpp
)

add_executable(
        hashes
        ${SAMPLE_SRC_DIR}/Hashes.cpp
)

add_executable(
        linkedlists
        ${SAMPLE_SRC_DIR}/LinkedLists.cpp
)

add_executable(
        lists
        ${SAMPLE_SRC_DIR}/Lists.cpp
)

add_executable(
        primitives
        ${SAMPLE_SRC_DIR}/Primitives.cpp
)

add_executable(
        queues
        ${SAMPLE_SRC_DIR}/Queues.cpp
)

add_executable(
        trees
        ${SAMPLE_SRC_DIR}/Trees.cpp
)

find_library(MATH_LIBRARY m)
if(MATH_LIBRARY)
    target_link_libraries(sample PUBLIC ${MATH_LIBRARY})
endif()