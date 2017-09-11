struct MyStruct {
  1: bool test = false
}

service MyService {
  string ping(1: string status)
}