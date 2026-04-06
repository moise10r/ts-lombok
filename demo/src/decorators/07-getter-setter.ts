import { Getter, Setter, AllArgsConstructor } from 'ts-lombok-kit/markers';

@Getter
@Setter
@AllArgsConstructor
class BankAccount {
  accountNumber: string = '';
  owner: string = '';
  balance: number = 0;
  active: boolean = false;
}

@Getter
@AllArgsConstructor
class ReadOnlyProfile {
  userId: number = 0;
  username: string = '';
  createdAt: string = '';
}

const account = new BankAccount('ACC-9901', 'Alice', 1000, true);

console.log(account.getAccountNumber()); // ACC-9901
console.log(account.getBalance());       // 1000
console.log(account.getActive());        // true

account.setBalance(account.getBalance() + 500);
console.log(account.getBalance());       // 1500

account.setActive(false);
console.log(account.getActive());        // false

const profile = new ReadOnlyProfile(42, 'alice', '2024-01-15');

console.log(profile.getUserId());   // 42
console.log(profile.getUsername()); // alice
