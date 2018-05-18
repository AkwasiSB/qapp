const Constants = require('~/config/constants');

import React, { Component } from 'react';
import { InteractionManager, LayoutAnimation, PermissionsAndroid, AsyncStorage } from 'react-native';
import I18n from 'react-native-i18n';
import Intro from './Intro';

export default class IntroContainer extends Component {
	state = {
		contents: [{
			key: '1',
			backgroundColor: Constants.colors.colorPrimary,
			image: require('~/assets/friendship.png'),
			title: I18n.t('Intro/slide1Title'),
			text: I18n.t('Intro/slide1Description')
		}, {
			key: '2',
			backgroundColor: Constants.colors.colorSecondary,
			image: require('~/assets/free.png'),
			title: I18n.t('Intro/slide2Title'),
			text: I18n.t('Intro/slide2Description')
		}, {
			key: '3',
			backgroundColor: Constants.colors.colorMidDay,
			image: require('~/assets/fast.png'),
			title: I18n.t('Intro/slide3Title'),
			text: I18n.t('Intro/slide3Description')
		}]
	}

    async componentDidMount() {
        await InteractionManager.runAfterInteractions();

        this.userId = await AsyncStorage.getItem('@userID');
    	this.deactivated = await AsyncStorage.getItem('@deactivatedAccount');

        if (!this.userId && !this.deactivated) {
			try {
				/* request all needed dangerous permissions in android on app first start */
				const resp = await PermissionsAndroid.requestMultiple([
					PermissionsAndroid.PERMISSIONS.GET_ACCOUNTS,
					PermissionsAndroid.PERMISSIONS.CAMERA,
					PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
					PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
					PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
					PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
					PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
					// PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
					// PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
					// PermissionsAndroid.PERMISSIONS.READ_SMS,
					// PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
				]);
			}
			catch (error) {
				//console.error(error);
			}
		}
    }

    componentWillUpdate() {
    	LayoutAnimation.easeInEaseOut();
    }

    handleMoveToNextPage = async () => {
    	if (this.userId && this.deactivated) {
    		this.props.navigation.navigate('Activation');
    	}
    	else {
    		this.props.navigation.navigate('Login');
    	}
    }

	render() {
		return (
			<Intro
				contents={this.state.contents}
				onMoveToNextPage={this.handleMoveToNextPage} />
		);
	}
}
