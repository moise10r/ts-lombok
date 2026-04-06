import { Value } from "ts-lombok-kit/markers";

// @Value is an alias for @Record — use it for value objects in DDD

@Value
class Money {
  amount: number = 0;
  currency: string = '';
}

@Value
class Coordinates {
  latitude: number = 0;
  longitude: number = 0;
}

const price = new Money(29.99, "USD");
console.log(price.toString());
// Money(amount=29.99, currency=USD)

const location = new Coordinates(48.8566, 2.3522);
console.log(location.toString());
// Coordinates(latitude=48.8566, longitude=2.3522)

console.log("frozen:", Object.isFrozen(price));
// frozen: true
