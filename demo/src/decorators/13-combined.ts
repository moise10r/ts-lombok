import {
  Record, Value, Data, Builder,
  Equals, With, NonNull,
  Log, Singleton, NoArgsConstructor, AllArgsConstructor,
} from 'ts-lombok-kit/markers';

// --- Immutable value objects ---

@Value
class Money {
  amount: number = 0;
  currency: string = '';
}

@Record
@Equals
class ProductId {
  value: string = '';
}

// --- Immutable + updatable entity ---

@Record
@With
@Equals
class Product {
  id: string = '';
  name: string = '';
  price: number = 0;
  stock: number = 0;
}

// --- Mutable entity ---

@Data
class Customer {
  @NonNull id: number = 0;
  @NonNull email: string = '';
  name: string = '';
  loyaltyPoints: number = 0;
}

// --- Builder for complex construction ---

@Builder
class Order {
  orderId: string = '';
  customerId: number = 0;
  productId: string = '';
  quantity: number = 0;
  total: number = 0;
  status: string = '';
  notes: string = '';
}

// --- Shared state ---

@Singleton
@NoArgsConstructor
class OrderCounter {
  count: number = 0;
  next(): string {
    return `ORD-${String(++this.count).padStart(4, '0')}`;
  }
}

// --- Service with logging ---

@Log
@NoArgsConstructor
class CheckoutService {
  declare log: Console;
  process(order: Order): void {
    this.log.info(`Processing order ${order.orderId} for customer ${order.customerId}`);
    this.log.info(`Total: ${order.total} | Status: ${order.status}`);
  }
}

// ============================================================
// Usage
// ============================================================

const price = new Money(49.99, 'USD');
console.log(price.toString());
// Money(amount=49.99, currency=USD)

const laptop = new Product('P-001', 'Laptop', 999, 10);
const discounted = laptop.withPrice(849);

console.log(laptop.price);     // 999
console.log(discounted.price); // 849
console.log(laptop.equals(new Product('P-001', 'Laptop', 999, 10))); // true

const customer = new Customer(1, 'alice@example.com', 'Alice', 0);
customer.setLoyaltyPoints(customer.getLoyaltyPoints() + 100);
console.log(customer.getLoyaltyPoints()); // 100

const counter = OrderCounter.getInstance();
const orderId1 = counter.next(); // ORD-0001
const orderId2 = counter.next(); // ORD-0002
console.log(orderId1, orderId2);

const order = Order.builder()
  .orderId(orderId1)
  .customerId(customer.getId())
  .productId(laptop.id)
  .quantity(1)
  .total(849)
  .status('pending')
  .notes('Gift wrap requested')
  .build();

const checkout = new CheckoutService();
checkout.process(order);
