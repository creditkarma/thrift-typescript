namespace cpp com.test.exceptions
namespace d com.test.exceptions
namespace dart com.test.exceptions
namespace java com.test.exceptions
namespace perl com.test.exceptions
namespace php com.test.exceptions
namespace haxe com.test.exceptions
namespace netcore com.test.exceptions

include "shared.thrift"

exception InvalidOperation {
  1: i32 whatOp,
  2: string why
}

exception InvalidResult {
  1: string message
  2: shared.Code code
}
