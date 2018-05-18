const Constants = require('~/config/constants');

import React from 'react';
import { BackHandler } from 'react-native';
import { SwitchNavigator, StackNavigator } from 'react-navigation';
import { AppLoadingContainer, IntroContainer, CreateUserContainer, AuthLoadingContainer,
		 ActivationContainer } from '~/containers';


const OnBoardScreens = StackNavigator({
	Intro: {
		screen: IntroContainer,
		navigationOptions: {
			header: null,
			gesturesEnabled: false
		}
	},
	CreateUser: {
		screen: CreateUserContainer,
		navigationOptions: {
			header: null,
			gesturesEnabled: false
		}
	},
	AuthLoading: {
		screen: AuthLoadingContainer,
		navigationOptions: {
			header: null,
			gesturesEnabled: false
		}
	},
	Activation: {
		screen: ActivationContainer,
		navigationOptions: {
			header: null,
			gesturesEnabled: false
		}
	}
}, {
	initialRouteName: 'Intro'
});


export const Screens = SwitchNavigator({
	AppLoadingScreen: AppLoadingContainer,
	OnBoardScreen: OnBoardScreens,
}, {
	initialRouteName: 'AppLoadingScreen'
});
