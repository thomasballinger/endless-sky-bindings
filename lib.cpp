// quick_example.cpp
#include <emscripten/bind.h>
#include <emscripten.h>

#include "endless-sky/source/Account.h"
#include "endless-sky/source/Angle.h"
#include "endless-sky/source/DataNode.h"
#include "endless-sky/source/Files.h"
#include "endless-sky/source/GameData.h"
#include "endless-sky/source/Point.h"
#include "endless-sky/source/Random.h"
#include "endless-sky/source/Set.h"
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
    .function("HasChildren", &DataNode::HasChildren)
    .function("PrintTrace", &DataNode::PrintTrace)
    .function("children", optional_override(
            [](DataNode& this_) {
              return std::vector<DataNode> { std::begin(this_), std::end(this_) };
            }
        ))
    ;
  register_vector<DataNode>("DataNodeVec");
}

// source/Dictionary
EMSCRIPTEN_BINDINGS(Dictionary) {
  class_<Dictionary>("Dictionary")
    .constructor<>()
    .function("Get", (double(Dictionary::*)(const std::string &) const)&Dictionary::Get)
    .function("Set", optional_override(
        [](Dictionary& this_, const std::string &key, double value) {
          this_[key] = value;
        }
    ))
    .function("keys", optional_override(
            [](Dictionary& this_) {
              std::vector<std::string> keys;
              for (auto elem: this_) {
                keys.push_back(elem.first);
              }
              return keys;
            }
        ))
    .function("values", optional_override(
            [](Dictionary& this_) {
              std::vector<double> values;
              for (auto elem: this_) {
                values.push_back(elem.second);
              }
              return values;
            }
        ))
    ;
}


// source/Files
EMSCRIPTEN_BINDINGS(Files) {
  class_<Files>("Files");
  function("_FilesRecursiveList", select_overload<std::vector<std::string>(const std::string&)>(&Files::RecursiveList));
  function("_FilesList", &Files::List);
  function("_FilesListDirectories", &Files::ListDirectories);
  function("FilesRecursiveList", optional_override([](std::string toMount) {
    std::string mountPoint = "/tmpFilesMount";
    EM_ASM({
      const mountPoint = UTF8ToString($1)
      console.log(1);
      FS.mkdir(mountPoint);
      console.log(2);
      FS.mount(NODEFS, { root: UTF8ToString($0)}, mountPoint);
      console.log(3);
    }, toMount.c_str(), mountPoint.c_str());
    auto list = Files::RecursiveList("/tmpFilesMount");
    EM_ASM({
      console.log(4);
      const mountPoint = UTF8ToString($0)
      console.log(5);
      FS.unmount(mountPoint);
      console.log(6);
      FS.rmdir(mountPoint);
    }, mountPoint.c_str());
    for (auto &s : list) {
      s.replace(0, mountPoint.size(), toMount);
    }
    return list;
  }));
}


// TODO make these static methods and properties on GameData
// source/GameData
EMSCRIPTEN_BINDINGS(GameData) {
  class_<GameData>("GameData");
  function("_GameDataBeginLoad", optional_override(
            [](std::vector<std::string> argVec) {
                std::vector<char *> cstrs;
                cstrs.reserve(argVec.size() + 2);
                for (auto &s : argVec) {
                    cstrs.push_back(const_cast<char *>(s.c_str()));
                }
                cstrs.push_back(NULL);
                std::cout << "argVec.size(): " << argVec.size() << "\n";
                std::cout << "cstrs.size(): " << cstrs.size() << "\n";
                std::cout << "cstrs.data(): " << *cstrs.data() << "\n";
                return GameData::BeginLoad(cstrs.data());
            }
        ));
  function("_GameDataBeginLoad2", optional_override(
            [](std::string arg1, std::string arg2) {
                std::vector<char *> *cstrs = new std::vector<char *>;
                cstrs->reserve(3);
                cstrs->push_back(const_cast<char *>(arg1.c_str()));
                cstrs->push_back(const_cast<char *>(arg2.c_str()));
                cstrs->push_back(NULL);
                return GameData::BeginLoad(cstrs->data());
            }
        ));
  function("_GameDataBeginLoad0", optional_override(
            []() {
                const char *argv[2] = {"progname", NULL};
                GameData::BeginLoad(argv);
                return true;
            }
        ));
  function("GameDataCheckReferences", &GameData::CheckReferences);
  function("GameDataShips", &GameData::Ships);
}

// TODO consider "custom marshalling" as described at https://github.com/emscripten-core/emscripten/issues/11070#issuecomment-717675128



// TODO can we write our own templates here to deal wtih this Set<T>?
// source/Set
EMSCRIPTEN_BINDINGS(Set) {
  typedef Set<Ship> SetOfShips;
  register_map<std::string, Ship>("ShipMap");
  register_vector<Ship>("ShipVec");
  class_<SetOfShips>("SetOfShips")
    .function("Get", (const Ship* (SetOfShips::*)(const std::string &) const)&SetOfShips::Get, allow_raw_pointer<ret_val>())
    .function("keys", optional_override(
            [](SetOfShips& this_) {
              std::vector<std::string> keys;
              for (auto elem: this_) {
                keys.push_back(elem.first);
              }
              return keys;
            }
        ))
    .function("values", optional_override(
            [](SetOfShips& this_) {
              std::vector<Ship> values;
              for (auto elem: this_) {
                values.push_back(elem.second);
              }
              return values;
            }
        ))
      ;
}

// TODO how do inner classes work?
// source/Ship
EMSCRIPTEN_BINDINGS(Ship) {
  class_<Ship>("Ship")
    .constructor<const DataNode&>()
    .function("Name", &Ship::Name)
    .function("ModelName", &Ship::ModelName)
    .function("Description", &Ship::Description)
    // I wonder how this gets set, it's currently 0
    .function("Cost", optional_override(
            [](Ship& this_) {
                return (int) this_.Ship::Cost();
            }
        ))
    .function("ChassisCost", optional_override(
            [](Ship& this_) {
                return (int) this_.Ship::ChassisCost();
            }
        ))
    .function("Attributes", &Ship::Attributes)
    .function("BaseAttributes", &Ship::BaseAttributes)
    .function("Recharge", &Ship::Recharge)

    .function("Place", &Ship::Place)
    .function("SetName", &Ship::SetName)
    .function("SetIsSpecial", &Ship::SetIsSpecial)

    .function("FinishLoading", &Ship::FinishLoading)

    .function("FlightCheck", &Ship::FlightCheck)
    ;
  register_vector<std::string>("StringVec");
  register_vector<double>("DoubleVec");
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

// source/Outfit
EMSCRIPTEN_BINDINGS(Outfit) {
  class_<Outfit>("Outfit")
    .constructor<>()
    .function("Load", &Outfit::Load)
    .function("Name", &Outfit::Name)
    .function("Attributes", &Outfit::Attributes)
    ;
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
