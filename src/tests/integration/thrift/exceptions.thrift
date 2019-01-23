namespace java exceptions
namespace js exceptions

include "shared.thrift"

exception InvalidOperation {
  1: i32 whatOp,
  2: string why
}

exception InvalidResult {
  1: string message
  2: shared.Code code
}
