// quick_example.cpp
#include <emscripten/bind.h>

#include "endless-sky/source/Random.h"
#include "endless-sky/source/DataNode.h"
#include "endless-sky/source/Angle.h"
#include "endless-sky/source/Point.h"

#include "endless-sky/tests/include/datanode-factory.h"

#include <iostream>
using namespace emscripten;

void randSeed(int seed) {
    const uint64_t s = (uint64_t) seed;
    Random::Seed(s);
}

int randInt(int mod) {
  const uint32_t m = (uint64_t) mod;
  auto raw = Random::Int(m);
  const unsigned int smallValue = (unsigned int) raw;
  return smallValue;
}


// DataNode factory
EMSCRIPTEN_BINDINGS(somethingwhatgoeshere) {
    function("AsDataNode", &AsDataNode);
}

// DataNode
EMSCRIPTEN_BINDINGS(my_class_example) {
  class_<DataNode>("DataNode")
    .constructor<const DataNode*>()
    .function("Size", &DataNode::Size)
    .function("Value", (double(DataNode::*)(int) const)&DataNode::Value)
    .function("IsNumber", (bool(DataNode::*)(int) const)&DataNode::IsNumber)
    .function("HasChildren", &DataNode::Size)
    .function("PrintTrace", &DataNode::PrintTrace)
    ;
}

// Angle
EMSCRIPTEN_BINDINGS(my_class_example2) {
  class_<Angle>("Angle")
    .constructor<>()
    .function("Degrees", &Angle::Degrees)
    ;
}

// Point
EMSCRIPTEN_BINDINGS(my_class_example4) {
  class_<Point>("Point")
    .constructor<double, double>()
    .function("X", &Point::Xval)
    .function("Y", &Point::Yval)
    .function("Set", &Point::Set)
    ;
  register_vector<Point>("PointVec");
  function("randSeed", &randSeed);
  function("randInt", &randInt);
}
