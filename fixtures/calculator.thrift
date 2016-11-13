namespace java com.twitter.finagle.example.thriftjava
#@namespace scala com.twitter.finagle.example.thriftscala

service Calculator {
  i32 add(1: i32 x, 2: i32 y);
}
