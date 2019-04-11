namespace java com.test.operation
namespace js com.test.operation

include "exceptions.thrift"

typedef exceptions.InvalidOperation JankyOperation
typedef exceptions.InvalidResult JankyResult

enum Operation {
  ADD = 1,
  SUBTRACT = 2,
  MULTIPLY = 3,
  DIVIDE = 4
}
