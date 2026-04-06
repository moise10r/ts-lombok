import {
  NoArgsConstructor,
  AllArgsConstructor,
  RequiredArgsConstructor,
} from 'ts-lombok-kit/markers';

@NoArgsConstructor
class AppSettings {
  theme: string = 'light';
  language: string = 'en';
  notifications: boolean = true;
}

const settings = new AppSettings();
console.log(settings.theme);         // light
console.log(settings.language);      // en
console.log(settings.notifications); // true

@AllArgsConstructor
class Address {
  street: string = '';
  city: string = '';
  state: string = '';
  zip: string = '';
  country: string = '';
}

const address = new Address('123 Main St', 'Paris', 'IDF', '75001', 'France');
console.log(address.street);  // 123 Main St
console.log(address.country); // France

@RequiredArgsConstructor
class Task {
  id: number = 0;
  title: string = '';
  done: boolean = false;
}

const task = new Task(1, 'Write documentation', false);
console.log(task.id);    // 1
console.log(task.title); // Write documentation
console.log(task.done);  // false
