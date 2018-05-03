namespace cpp exceptions
namespace d exceptions
namespace dart exceptions
namespace java exceptions
namespace perl exceptions
namespace php exceptions
namespace haxe exceptions
namespace netcore exceptions

include "shared.thrift"

exception InvalidOperation {
  1: i32 whatOp,
  2: string why
}

exception InvalidResult {
  1: string message
  2: shared.Code code
}
