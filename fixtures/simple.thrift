struct MyStruct {
    1: required int id,
    2: required bool field1,
    # 3: required string field,
    4: required i16 field,
    5: required map<string, bool> things
}
exception Exception1 {
    1: required i32 error_code,
    2: required string error_name,
    3: optional string message,
}
exception Exception2 {
    1: required i32 error_code,
    2: required string error_name,
    3: optional string message,
}
service Service1 {
    bool ping() throws (1: Exception1 user_exception, 2: Exception2 system_exception)
    list<MyStruct> test(1: MyStruct ms)
        throws (1: Exception1 user_exception, 2: Exception2 system_exception)
}
