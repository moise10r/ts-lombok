import { Record, Equals } from 'ts-lombok-kit/markers';

@Record
@Equals
class Point {
  x: number = 0;
  y: number = 0;
}

@Record
@Equals
class Product {
  sku: string = '';
  name: string = '';
  price: number = 0;
}

const a = new Point(10, 20);
const b = new Point(10, 20);
const c = new Point(99, 0);

console.log(a.equals(b));     // true
console.log(a.equals(c));     // false
console.log(a.equals(null));  // false

console.log(a.hashCode() === b.hashCode()); // true
console.log(a.hashCode() === c.hashCode()); // false

console.log(a === b);       // false — different instances
console.log(a.equals(b));   // true  — same content

const p1 = new Product('SKU-001', 'Laptop', 999);
const p2 = new Product('SKU-001', 'Laptop', 999);
console.log(p1.equals(p2)); // true
