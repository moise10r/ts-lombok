import { Builder } from 'ts-lombok-kit/markers';

@Builder
class ServerConfig {
  host: string = '';
  port: number = 0;
  ssl: boolean = false;
  timeout: number = 0;
  maxConnections: number = 0;
}

@Builder
class EmailMessage {
  from: string = '';
  to: string = '';
  subject: string = '';
  body: string = '';
  cc: string = '';
  replyTo: string = '';
}

const config = ServerConfig.builder()
  .host('api.example.com')
  .port(443)
  .ssl(true)
  .timeout(5000)
  .maxConnections(100)
  .build();

console.log('host:', config.host);           // api.example.com
console.log('port:', config.port);           // 443
console.log('ssl:', config.ssl);             // true
console.log('timeout:', config.timeout);     // 5000
console.log('connections:', config.maxConnections); // 100

const email = EmailMessage.builder()
  .from('noreply@app.com')
  .to('user@example.com')
  .subject('Welcome!')
  .body('Thanks for signing up.')
  .cc('')
  .replyTo('support@app.com')
  .build();

console.log('from:', email.from);
console.log('subject:', email.subject);

const devConfig = ServerConfig.builder()
  .host('localhost')
  .port(3000)
  .ssl(false)
  .timeout(30000)
  .maxConnections(10)
  .build();

console.log('dev host:', devConfig.host);    // localhost
console.log('prod host:', config.host);      // api.example.com
