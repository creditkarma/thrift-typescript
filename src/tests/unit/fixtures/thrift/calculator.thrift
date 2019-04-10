namespace cpp com.test.calculator
namespace d com.test.calculator
namespace dart com.test.calculator
namespace java com.test.calculator
namespace php com.test.calculator
namespace perl com.test.calculator
namespace haxe com.test.calculator
namespace netcore com.test.calculator

include "shared.thrift"
include "common.thrift"
include "operation.thrift"

typedef i32 MyInteger
typedef operation.Operation Operation
typedef common.CommonStruct CommonStruct

const i32 INT32CONSTANT = 9853
const map<string,string> MAPCONSTANT = {'hello':'world', 'goodnight':'moon'}

struct Work {
  1: required i32 num1 = 0,
  2: required i32 num2,
  3: optional Operation op = Operation.ADD,
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

exception NotAGoodIdea {
    1: string message
}

service Calculator extends shared.SharedService {

   void ping(),

   i32 add(1: i32 num1, 2: i32 num2) throws (1: operation.JankyResult exp),

   i64 addInt64(1: i64 num1, 2: i64 num2) throws (1: NotAGoodIdea exp),

   i32 addWithContext(1: i32 num1, 2: i32 num2),

   i32 calculate(1:i32 logid, 2:Work work) throws (1: operation.JankyOperation ouch),

   string echoBinary(1: binary word)

   string echoString(1: string word)

   string checkName(1: Choice choice),

   string checkOptional(1: optional string type),

   list<i32> mapOneList(1: list<i32> arg)

   list<i32> mapValues(1: map<string,i32> arg)

   map<string,string> listToMap(1: list<list<string>> arg)

   common.CommonStruct fetchThing()

   /**
    * This method has a oneway modifier. That means the client only makes
    * a request and does not listen for any response at all. Oneway methods
    * must be void.
    */
   oneway void zip()

}

/**
 * That just about covers the basics. Take a look in the test/ folder for more
 * detailed examples. After you run this file, your generated code shows up
 * in folders with names gen-<language>. The generated code isn't too scary
 * to look at. It even has pretty indentation.
 */
