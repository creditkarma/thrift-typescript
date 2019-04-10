namespace cpp com.test.shared
namespace d com.test.share // "shared" would collide with the eponymous D keyword.
namespace dart com.test.shared
namespace java com.test.shared
namespace perl com.test.shared
namespace php com.test.shared
namespace haxe com.test.shared
namespace netcore com.test.shared

const i32 SHARED_INT = 45

struct Code {
  1: i64 status
}

struct SharedStruct {
  1: required Code code
  2: required string value
}

union SharedUnion {
  1: string option1
  2: string option2
}

service SharedService {
  SharedStruct getStruct(1: i32 key)
  SharedUnion getUnion(1: i32 index)
}
