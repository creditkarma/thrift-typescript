namespace java com.test.operation
namespace js com.test.operation

include "exceptions.thrift"

typedef exceptions.InvalidOperation JankyOperation
typedef exceptions.InvalidResult JankyResult

/**
 * You can define enums, which are just 32 bit integers. Values are optional
 * and start at 1 if not supplied, C style again.
 */
enum Operation {
  ADD = 1,
  SUBTRACT = 2,
  MULTIPLY = 3,
  DIVIDE = 4
}

typedef Operation SomethingToDo
