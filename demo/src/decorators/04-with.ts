import { Record, With } from 'ts-lombok-kit/markers';

@Record
@With
class Order {
  orderId: string = '';
  status: string = '';
  total: number = 0;
}

@Record
@With
class UserProfile {
  id: number = 0;
  username: string = '';
  email: string = '';
  role: string = '';
}

const order = new Order('ORD-001', 'pending', 150);
const shipped = order.withStatus('shipped');

console.log(order.status);    // pending
console.log(shipped.status);  // shipped
console.log(order === shipped); // false

const order2 = order
  .withStatus('processing')
  .withTotal(145);

console.log(order2.toString());
// Order(orderId=ORD-001, status=processing, total=145)

console.log(order.toString());
// Order(orderId=ORD-001, status=pending, total=150)

const user = new UserProfile(1, 'alice', 'alice@example.com', 'viewer');
const admin = user.withRole('admin');

console.log(user.role);   // viewer
console.log(admin.role);  // admin
console.log(admin.email); // alice@example.com
