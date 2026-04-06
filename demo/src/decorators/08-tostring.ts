import { ToString, AllArgsConstructor } from 'ts-lombok-kit/markers';

@ToString
@AllArgsConstructor
class LogEntry {
  timestamp: string = '';
  level: string = '';
  message: string = '';
}

@ToString
@AllArgsConstructor
class ApiResponse {
  statusCode: number = 0;
  status: string = '';
  path: string = '';
}

const entry = new LogEntry('2024-06-01T12:00:00Z', 'INFO', 'Server started');
console.log(entry.toString());
// LogEntry(timestamp=2024-06-01T12:00:00Z, level=INFO, message=Server started)

const response = new ApiResponse(200, 'OK', '/api/users');
console.log(response.toString());
// ApiResponse(statusCode=200, status=OK, path=/api/users)

console.log(`Response: ${response}`);
// Response: ApiResponse(statusCode=200, status=OK, path=/api/users)
