namespace java com.creditkarma

// Should include files in other namespaces
include "core/location.thrift"

exception MyException {
  1: string message;
  2: location.Status status;
}

exception OtherException {
  1: i32 code
  2: location.Status status
}