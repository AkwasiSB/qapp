import { AppRegistry, YellowBox } from 'react-native';
import App from './app/index';

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

AppRegistry.registerComponent('Q', () => App);
