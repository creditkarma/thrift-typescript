namespace java com.core.common
namespace js com.core.common

include "shared.thrift"

typedef shared.SharedStruct CommonStruct
typedef shared.SharedUnion CommonUnion
typedef shared.SHARED_INT COMMON_INT

exception AuthException {
  1: i32 code
  2: string message
}

union OtherCommonUnion {
    1: string option1
    2: i32 option2
}

typedef AuthException NotAllowed
typedef OtherCommonUnion MoreOptions
