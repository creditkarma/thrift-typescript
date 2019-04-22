/**
 * Thrift files can namespace, package, or prefix their output in various
 * target languages.
 */
namespace cpp com.test.common
namespace d com.test.common
namespace dart com.test.common
namespace java com.test.common
namespace php com.test.common
namespace perl com.test.common
namespace haxe com.test.common
namespace netcore com.test.common

include "shared.thrift"

typedef shared.SharedStruct CommonStruct
typedef shared.SharedUnion CommonUnion
typedef shared.SharedEnum CommonEnum
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
