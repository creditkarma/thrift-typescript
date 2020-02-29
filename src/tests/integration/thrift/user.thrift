namespace java com.test.user
namespace js com.test.user

struct User {
  1: string name
}

service UserService {
    User getUser(1: i64 id)
    list<User> getUsers(1: list<i64> ids)
}
