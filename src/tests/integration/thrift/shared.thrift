namespace java shared
namespace js shared

const i32 SHARED_INT = 45

struct SharedStruct {
  1: required i32 key
  2: required string value
}

struct Code {
  1: i32 status
}

union SharedUnion {
  1: string option1
  2: string option2
}

service SharedService {
  SharedStruct getStruct(1: i32 key)
  SharedUnion getUnion(1: i32 index)
}
