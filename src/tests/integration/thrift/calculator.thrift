include "shared.thrift"
include "operation.thrift"

namespace cpp calculator
namespace d calculator
namespace dart calculator
namespace java calculator
namespace php calculator
namespace perl calculator
namespace haxe calculator
namespace netcore calculator

typedef i32 MyInteger

typedef operation.Operation Operation

const i32 INT32CONSTANT = 9853
const map<string,string> MAPCONSTANT = {'hello':'world', 'goodnight':'moon'}

struct Work {
  1: required i32 num1 = 0,
  2: required i32 num2,
  3: required Operation op,
  4: optional string comment,
}

exception InvalidOperation {
  1: i32 whatOp,
  2: string why
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

service Calculator extends shared.SharedService {

   void ping(),

   i64 add(1:i64 num1, 2:i64 num2),

   i32 calculate(1:i32 logid, 2:Work w) throws (1:InvalidOperation ouch),

   string echoBinary(1: binary word)

   string echoString(1: string word)

   string checkName(1: Choice choice)

   string checkOptional(1: optional string type)

   list<i32> mapOneList(1: list<i32> arg)

   list<i32> mapValues(1: map<string,i32> arg)

   map<string,string> listToMap(1: list<list<string>> arg)

   oneway void zip()

}
