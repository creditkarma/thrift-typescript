include 'simple'

namespace js.ts MyThing

typedef string Json
typedef i32 MyInteger
typedef CustomJson NestedJson
typedef Json CustomJson
typedef map<string, string> CustomMap
typedef Embed myEmbed
// typedef whoops partial
// typedef NotDefined whoops

const bool FALSE_CONST = false
const bool TRUE_CONST = true
const byte BYTE_CONST = 1
const i8 I8_CONST = 1
const double DOUBLE_CONST = 1.2
const i16 I16_CONST = 123
const i32 I32_CONST = 123
const i64 I64_CONST = 123
const string STRING_CONST = 'test'
// Containers
const set<string> SET_CONST = ['hello', 'world', 'foo', 'bar']
const set<set<string>> SET_SET_CONST = [['hello', 'world'], ['foo', 'bar']]
const list<string> LIST_CONST = ['hello', 'world', 'foo', 'bar']
const list<list<string>> LIST_LIST_CONST = [['hello', 'world'], ['foo', 'bar']]
const list<set<string>> LIST_SET_CONST = [['hello', 'world'], ['foo', 'bar']]
const set<list<string>> SET_LIST_CONST = [['hello', 'world'], ['foo', 'bar']]
const map<string,string> MAP_CONST = {'hello': 'world'}
const map<i16, map<string,string>> MAP_MAP_CONST = {123: {'hello': 'world'}}
const list<set<map<string,string>>> LIST_SET_MAP_CONST = [[{'hello': 'world'}, {'foo': 'bar'}]]
// Type Aliases
const Json ALIAS_CONST = 'test'
const CustomMap CONTAINER_ALIAS_CONST = {'hello': 'world'}
// Structs
const Basic STRUCT_CONST = {'name': 'blaine'}
const WithContainers CONTAINER_STRUCT_CONST = {'map': {'hello': 'world'}}

union ComparableUnion {
  1: string field1;
  2: required string field2;
}

struct Embed {}

struct Basic {
    1: string name
}

struct WithContainers {
    1: map<string, string> map
}

struct MyStruct {
    1: required i32 id,
    2: required bool field1,
    # 3: required string field,
    4: required i16 field,
    // 5: set<set<set<string>>> aSet,
    // 6: list<list<list<string>>> aList,
    // 7: list<set<string>> aSetList,
    // 8: map<string, string> aMap,
    // 9: set<string> set2,
    // 10: map<map<string, string>, map<i16, i16>> mapMapMap,
    11: NestedJson someJson,
    12: Embed embedded,
    // TODO: containers of structs
}
exception Exception1 {
    1: required i32 error_code,
    2: required string error_name,
    3: optional string message,
}
exception Exception2 {
    1: required i32 error_code,
    2: required string error_name,
    3: optional string message,
}
service Service1 {
    bool ping() throws (1: Exception1 user_exception, 2: Exception2 system_exception)
    list<MyStruct> test(1: MyStruct ms)
        throws (1: Exception1 user_exception, 2: Exception2 system_exception)
}
