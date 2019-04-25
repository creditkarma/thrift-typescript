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

enum SharedEnum {
    value1
    value2
}

service SharedService {
  SharedStruct getStruct(1: i32 key)
  SharedUnion getUnion(1: i32 index)
  SharedEnum getEnum()
}
