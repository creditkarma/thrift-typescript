namespace java lonely

include "shared.thrift"
include "common.thrift"
include "operation.thrift"

const map<string,operation.Response> ENUM_CONST = { 'id': 32 }

service LonelyService {
    void ping() throws (1: common.AuthException exp)
    shared.SharedStruct get(1: i32 id)
}
