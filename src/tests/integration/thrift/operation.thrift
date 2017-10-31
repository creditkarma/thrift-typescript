namespace cpp operation
namespace d operation // "operation" would collide with the eponymous D keyword.
namespace dart operation
namespace java operation
namespace perl operation
namespace php operation
namespace haxe operation
namespace netcore operation

/**
 * You can define enums, which are just 32 bit integers. Values are optional
 * and start at 1 if not supplied, C style again.
 */
enum Operation {
  ADD = 1,
  SUBTRACT = 2,
  MULTIPLY = 3,
  DIVIDE = 4
}
