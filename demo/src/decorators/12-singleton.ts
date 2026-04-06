import { Singleton, NoArgsConstructor } from 'ts-lombok-kit/markers';

@Singleton
@NoArgsConstructor
class DatabasePool {
  connectionString: string = 'postgres://localhost:5432/mydb';
  maxConnections: number = 10;
  activeConnections: number = 0;

  connect(): void {
    this.activeConnections++;
    console.log(`Connected. Active: ${this.activeConnections}/${this.maxConnections}`);
  }

  disconnect(): void {
    this.activeConnections--;
    console.log(`Disconnected. Active: ${this.activeConnections}/${this.maxConnections}`);
  }
}

@Singleton
@NoArgsConstructor
class FeatureFlags {
  darkMode: boolean = false;
  betaFeatures: boolean = false;
  maintenanceMode: boolean = false;
}

const pool1 = DatabasePool.getInstance();
const pool2 = DatabasePool.getInstance();

console.log(pool1 === pool2); // true

pool1.connect();
pool2.connect();
pool1.disconnect();

const flags = FeatureFlags.getInstance();
flags.darkMode = true;

const sameFlags = FeatureFlags.getInstance();
console.log(sameFlags.darkMode); // true
