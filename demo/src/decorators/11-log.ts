import { Log, NoArgsConstructor, AllArgsConstructor } from 'ts-lombok-kit/markers';

@Log
@NoArgsConstructor
class PaymentService {
  declare log: Console;

  process(amount: number, currency: string): void {
    this.log.info(`Processing payment: ${amount} ${currency}`);
  }

  refund(transactionId: string): void {
    this.log.warn(`Refunding transaction: ${transactionId}`);
  }

  handleError(err: Error): void {
    this.log.error('Payment failed:', err.message);
  }
}

@Log
@AllArgsConstructor
class AuthService {
  realm: string = '';
  declare log: Console;

  login(username: string): void {
    this.log.info(`[${this.realm}] Login attempt: ${username}`);
  }

  logout(username: string): void {
    this.log.info(`[${this.realm}] Logout: ${username}`);
  }
}

const payments = new PaymentService();
payments.process(99.99, 'USD');
// Processing payment: 99.99 USD

payments.refund('TXN-4821');
// Refunding transaction: TXN-4821

payments.handleError(new Error('Card declined'));
// Payment failed: Card declined

const auth = new AuthService('production');
auth.login('alice');
// [production] Login attempt: alice

auth.logout('alice');
// [production] Logout: alice
