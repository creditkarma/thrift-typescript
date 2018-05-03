/**
 * Thrift files can namespace, package, or prefix their output in various
 * target languages.
 */
namespace cpp common
namespace d common
namespace dart common
namespace java common
namespace php common
namespace perl common
namespace haxe common
namespace netcore common

include "shared.thrift"

typedef shared.SharedStruct CommonStruct
typedef shared.SharedUnion CommonUnion
typedef shared.SHARED_INT COMMON_INT

exception AuthException {
  1: i32 code
  2: string message
}
