const Constants = require('~/config/constants');

import React, { Component } from 'react';
import { LayoutAnimation, InteractionManager, AsyncStorage, Platform, NetInfo, PermissionsAndroid, Keyboard, Alert } from 'react-native';
import I18n from 'react-native-i18n';
import { hFS, hCamera } from '~/utils/device-services';
import CreateUser from './CreateUser';

export default class CreateUserContainer extends Component {
	state = {
		titleSpacing: 18,
		imageSpacing: 15,
		hideImageSize: 120,
		isImageLoaderVisible: 0,
		subTitle: I18n.t('CreateUser/subTitle'),
		imageUrl: null,
		imageNameValue: null,
		usernameValue: '',
		statusValue: '',
		selectedValue: '',
		isButtonDisabled: true,
		isPickerModalVisible: false
	}

	componentWillMount() {
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
	}

	async componentDidMount() {
		await InteractionManager.runAfterInteractions();

		const { userSocialData, socialType } = this.props.navigation.state.params;

		this.userSocialData = userSocialData;

		if (userSocialData) {
			const text = `${I18n.t('CreateUser/dialog/text')} ${socialType}?`;

			Alert.alert(I18n.t('CreateUser/dialog/title'), text, [
				{
					text: I18n.t('AlertDialog/noButtonLabel')
				},{
					text: I18n.t('AlertDialog/yesButtonLabel'),
					onPress: () => {
						this.setState({
							imageUrl: { uri: userSocialData.image },
							imageNameValue: userSocialData.image,
							usernameValue: userSocialData.username
						});
					}
				}
			], {
				cancelable: false
			});
		}
	}

	componentWillUpdate() {
		LayoutAnimation.easeInEaseOut();
	}

	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	keyboardDidShow = () => {
		this.setState({
			titleSpacing: 15,
			imageSpacing: 0,
			hideImageSize: 0,
			subTitle: I18n.t('Global/inputMaxLengthLabel')
		});
	}

	keyboardDidHide = () => {
		this.setState({
			titleSpacing: 25,
			imageSpacing: 15,
			hideImageSize: 120,
			subTitle: I18n.t('CreateUser/subTitle')
		});
	}

	handleTogglePickerModalVisibility = () => {
		this.setState({
			isPickerModalVisible: !this.state.isPickerModalVisible
		});
	}

	handleStartImageLoading = async (progress) => {
		if (progress == 'start') {
			await this.setState({
				isImageLoaderVisible: 1,
				isButtonDisabled: true
			});
		}
		else {
			await this.setState({
				isImageLoaderVisible: 0,
				isButtonDisabled: this.state.usernameValue === '' ? true : false
			});
		}
	}

	handleGetUserProfileImage = async (selectedOption) => {
        await this.setState({
        	isPickerModalVisible: !this.state.isPickerModalVisible
        });

        await InteractionManager.runAfterInteractions();

		if (selectedOption === 0) {
			const openCamera = () => {
				hCamera.openCamera({
					crop: true
				}).then(async (image) => {
					await this.setState({
						imageUrl: { uri: image.path },
						imageNameValue: image.path
					});
				}).catch((error) => {
					// console.error(error);
				});
			};

			hCamera.getPermission(openCamera);
		}
		else if (selectedOption === 1) {
			const openGallery = () => {
				hCamera.openGallery(false, {
					crop: true
				}).then(async (image) => {
					await this.setState({
						imageUrl: { uri: image.path },
						imageNameValue: image.path
					});
				}).catch((error) => {
					// console.error(error);
				});
			};

			hFS.getPermission(openGallery);
		}
		else if (selectedOption === 2) {
			await this.setState({
				imageUrl: defaultImage,
				imageNameValue: null
			});
		}
	}

	handleGetTextValue = async (text, params) => {
		if (params == 'inputUsername') {
			await this.setState({
				usernameValue: text
			});

			if (text.length > 0) {
				await this.setState({
					isButtonDisabled: this.state.isImageLoaderVisible === 1 ? true : false
				});
			}
			else if (text.length === 0) {
				await this.setState({
					isButtonDisabled: true
				});
			}
		}
		else {
			await this.setState({
				statusValue: text
			});
		}
	}

	handleCreateUserProfile = async () => {
		if (this.state.usernameValue === '') {
			return;
		}

		const userCredential = {
			loginType: this.props.navigation.state.params.socialType,
			...this.userSocialData
		};

		const pageInfo = {
		    pageColor: Constants.colors.colorMidNight,
		    pageText: I18n.t('CreateUser/loadingPageText'),
		    previousPage: 'CreateUser',
		    userCredential
		};

		const userInfo = {
			username: this.state.usernameValue,
		    status: this.state.statusValue,
		    phoneNumber: this.userSocialData.phoneNumber,
		    profile_image: { url: this.state.imageNameValue },
		    deviceType: Platform.OS
		};

		try {
			const isConnected = await NetInfo.isConnected.fetch();

			if (isConnected) {
			    const permResp = await PermissionsAndroid.request(
			        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
			    );

			    if (permResp === 'granted') {
			        await AsyncStorage.setItem('@tempUserData', JSON.stringify(userInfo));

					this.props.navigation.navigate('AuthLoading', pageInfo);
			    }
			}
			else {
				Alert.alert(I18n.t('Global/dialog/networkTitle'), I18n.t('Global/dialog/networkText'), [
		            { text: I18n.t('Global/dialog/buttonLabel') }
		        ]);
			}
		}
		catch (error) {
			// console.error(error);
		}
	}

	render() {
		return (
			<CreateUser
				titleSpacing={this.state.titleSpacing}
				subTitle={this.state.subTitle}
				hideImageSize={this.state.hideImageSize}
				imageSpacing={this.state.imageSpacing}
				imageUrl={this.state.imageUrl}
				onStartImageLoading={this.handleStartImageLoading}
				isImageLoaderVisible={this.state.isImageLoaderVisible}
				usernameValue={this.state.usernameValue}
				statusValue={this.state.statusValue}
				onGetTextValue={this.handleGetTextValue}
				onCreateUserProfile={this.handleCreateUserProfile}
				isButtonDisabled={this.state.isButtonDisabled}
				isPickerModalVisible={this.state.isPickerModalVisible}
				onTogglePickerModalVisibility={this.handleTogglePickerModalVisibility}
				onGetUserProfileImage={this.handleGetUserProfileImage} />
		);
	}
};
