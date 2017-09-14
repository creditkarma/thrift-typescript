namespace java com.creditkarma.location

include "status_type.thrift"

typedef string PersonName
typedef string CityName

struct Status {
  1: status_type.StatusType code
  2: string name
  3: PersonName person
}