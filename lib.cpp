// quick_example.cpp
#include <emscripten/bind.h>

#include "endless-sky/source/Account.h"
#include "endless-sky/source/Angle.h"
#include "endless-sky/source/DataNode.h"
#include "endless-sky/source/Random.h"
#include "endless-sky/source/Point.h"
#include "endless-sky/source/Ship.h"

#include "endless-sky/tests/include/datanode-factory.h"

#include <iostream>
using namespace emscripten;

// source/Account
EMSCRIPTEN_BINDINGS(Account) {
  class_<Account>("Account")
    .constructor<>()
    // TODO is optional_override always necessary for int64_t? Could we change int64_t?
    .function("Credits", optional_override(
            [](Account& this_) {
                return (int) this_.Account::Credits();
            }
        ))
    .function("AddCredits", optional_override(
            [](Account& this_, int value) {
                return this_.Account::AddCredits((int64_t) value);
            }
        ))
    ;
}

// source/Angle
EMSCRIPTEN_BINDINGS(Angle) {
  class_<Angle>("Angle")
    // TODO how to use multiple constructor overloads?
    .constructor<double>()
    .function("Degrees", &Angle::Degrees)
    // TODO how to bind operator overloads?
    .function("Unit", &Angle::Unit)
    .function("Rotate", &Angle::Rotate)
    ;
}


// test/src/helpers/datanode-factory
EMSCRIPTEN_BINDINGS(AsDataNode) {
    function("AsDataNode", &AsDataNode);
}

// source/DataNode
EMSCRIPTEN_BINDINGS(DataNode) {
  class_<DataNode>("DataNode")
    .constructor<const DataNode*>()
    .function("Size", &DataNode::Size)
    .function("Value", (double(DataNode::*)(int) const)&DataNode::Value)
    .function("Token", &DataNode::Token)
    .function("IsNumber", (bool(DataNode::*)(int) const)&DataNode::IsNumber)
    .function("HasChildren", &DataNode::Size)
    .function("PrintTrace", &DataNode::PrintTrace)
    .function("children", optional_override(
            [](DataNode& this_) {
              return std::vector<DataNode> { std::begin(this_), std::end(this_) };
            }
        ))
    ;
  register_vector<DataNode>("DataNodeVec");
}

// TODO how do inner classes work?
// source/Ship
EMSCRIPTEN_BINDINGS(Ship) {
  class_<Ship>("Ship")
    .constructor<const DataNode&>()
    .function("Name", &Ship::Name)
    .function("ModelName", &Ship::ModelName)
    .function("Description", &Ship::Description)
    .function("Cost", &Ship::Cost)
    .function("ChassisCost", &Ship::ChassisCost)
    .function("FlightCheck", &Ship::FlightCheck)
    ;
  register_vector<std::string>("StringVec");
}

// Examples of writing custom functions
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


// source/Point
EMSCRIPTEN_BINDINGS(Point) {
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
