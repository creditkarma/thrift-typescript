namespace java common
namespace js common

include "shared.thrift"

typedef shared.SharedStruct CommonStruct
typedef shared.SharedUnion CommonUnion
typedef shared.SHARED_INT COMMON_INT

exception AuthException {
  1: i32 code
  2: string message
}
