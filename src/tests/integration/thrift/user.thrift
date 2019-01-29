namespace java user
namespace js user

struct User {
  1: string name
}

service UserService {
    User getUser(1: i64 id)
}
