if (typeof globalThis !== 'undefined') {
  (globalThis as any).__reanimatedLoggerConfig = {
    level: 1,
    strict: false,
  };
}

import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { LogBox } from 'react-native';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

LogBox.ignoreLogs([
  '[Reanimated] Reading from `value` during component render',
  'Reading from `value` during component render',
]);

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

