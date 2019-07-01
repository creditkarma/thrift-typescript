const i32 SHARED_INT = 45

struct Code {
  1: i64 status
}

struct SharedStruct {
  1: required Code code
  2: required string value
  3: optional map<string, string> mapWithDefault = {}
}

union SharedUnion {
  1: string option1
  2: string option2
}

enum SharedEnum {
    value1
    value2
}

service SharedServiceBase {
    SharedStruct getStruct(1: i32 key)
}

service SharedService extends SharedServiceBase {
  SharedUnion getUnion(1: i32 index)
  SharedEnum getEnum()
}
