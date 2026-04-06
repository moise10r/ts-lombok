import { Data } from 'ts-lombok-kit/markers';

@Data
class Person {
  id: number = 0;
  firstName: string = '';
  lastName: string = '';
  age: number = 0;
}

@Data
class Product {
  sku: string = '';
  name: string = '';
  price: number = 0;
  stock: number = 0;
}

const person = new Person(1, 'Jane', 'Smith', 30);
console.log(person.toString());
// Person(id=1, firstName=Jane, lastName=Smith, age=30)

console.log(person.getFirstName()); // Jane
console.log(person.getAge());       // 30

person.setAge(31);
console.log(person.getAge());       // 31

const person2 = new Person(1, 'Jane', 'Smith', 31);
console.log(person.equals(person2));              // true
console.log(person.hashCode() === person2.hashCode()); // true

const item = new Product('SKU-001', 'Keyboard', 79.99, 50);
console.log(item.toString());
// Product(sku=SKU-001, name=Keyboard, price=79.99, stock=50)

item.setStock(item.getStock() - 1);
console.log('Stock after sale:', item.getStock()); // 49
