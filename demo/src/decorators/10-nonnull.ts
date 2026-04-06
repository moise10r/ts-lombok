import { AllArgsConstructor, NonNull } from 'ts-lombok-kit/markers';

@AllArgsConstructor
class User {
  @NonNull id: number = 0;
  @NonNull username: string = '';
  @NonNull email: string = '';
  bio: string | undefined = undefined;
}

@AllArgsConstructor
class Invoice {
  @NonNull invoiceId: string = '';
  @NonNull clientName: string = '';
  @NonNull total: number = 0;
  notes: string | undefined = undefined;
}

const user = new User(1, 'alice', 'alice@example.com', 'Developer');
console.log(user.username); // alice
console.log(user.bio);      // Developer

const user2 = new User(2, 'bob', 'bob@example.com', undefined);
console.log(user2.bio); // undefined

const invoice = new Invoice('INV-001', 'Acme Corp', 5000, undefined);
console.log(invoice.invoiceId);   // INV-001
console.log(invoice.clientName);  // Acme Corp
