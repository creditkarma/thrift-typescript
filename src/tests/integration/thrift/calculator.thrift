include "shared.thrift"
include "common/common.thrift"
include "operation.thrift"

namespace java calculator
namespace js calculator

typedef i32 MyInteger
typedef operation.Operation Operation
typedef common.CommonStruct CommonStruct

const i32 INT32CONSTANT = 9853
const map<string,string> MAPCONSTANT = {'hello':'world', 'goodnight':'moon'}

struct Work {
  1: required i32 num1 = 0,
  2: required i32 num2,
  3: Operation op = Operation.ADD,
  4: optional string comment,
}

struct FirstName {
  1: string name
}

struct LastName {
  1: string name
}

union Choice {
  1: FirstName firstName
  2: LastName lastName
}

exception ExceptionOne {
    1: string message
}

exception ExceptionTwo {
    1: string whatHappened
}

service Calculator extends shared.SharedService {

   void ping(),

   i32 add(1: i32 num1, 2: i32 num2) throws (1: operation.JankyResult exp),

   i64 addInt64(1: i64 num1, 2: i64 num2),

   i32 calculate(1:i32 logid, 2:Work work) throws (1: operation.JankyOperation ouch),

   string echoBinary(1: binary word)

   string echoString(1: string word)

   string checkName(1: Choice choice),

   string checkOptional(1: optional string type),

   list<i32> mapOneList(1: list<i32> arg)

   list<i32> mapValues(1: map<string,i32> arg)

   map<string,string> listToMap(1: list<list<string>> arg)

   common.CommonStruct fetchThing()

   void throw(1: i32 num) throws (1: ExceptionOne exp1, 2: ExceptionTwo exp2)

   oneway void zip()

}
