namespace java com.creditkarma.location

include "status_type.thrift"

typedef string PersonName

struct Status {
  1: status_type.StatusType code
  2: string name
  3: PersonName person
}