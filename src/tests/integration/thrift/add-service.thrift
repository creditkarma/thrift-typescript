namespace java com.test.add-service
namespace js com.test.add-service

service AddService {

   void ping(),

   i32 add(1: i32 num1, 2: i32 num2),

   i64 addInt64(1: i64 num1, 2: i64 num2),

}
