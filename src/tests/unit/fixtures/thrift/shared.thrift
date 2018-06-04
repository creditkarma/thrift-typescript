namespace cpp shared
namespace d share // "shared" would collide with the eponymous D keyword.
namespace dart shared
namespace java shared
namespace perl shared
namespace php shared
namespace haxe shared
namespace netcore shared

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
