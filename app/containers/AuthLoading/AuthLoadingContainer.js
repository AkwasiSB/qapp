const Constants = require('~/config/constants');

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { LayoutAnimation, InteractionManager, Platform, PermissionsAndroid, Alert, AsyncStorage, BackHandler } from 'react-native';
import { AccessToken } from 'react-native-fbsdk';
import FCM from 'react-native-fcm';
import axios from 'axios';
import oauthSignature from 'oauth-signature';
import moment from 'moment-timezone';
import I18n from 'react-native-i18n';
import { isOldUser, authenticateUser, getAuthUserData, createNewUser, updateUserProfile } from '~/api/user';
import { twitterConsumerKey, twitterConsumerSecret } from '~/config/constants';
import { hFS, hCamera } from '~/utils/device-services';
import { generateNonce, toggleToastNotification } from '~/utils/helpers';
import AuthLoading from './AuthLoading';

export default class AuthLoadingContainer extends Component {
    state = {
        pageText: '',
        pageColor: '',
        isLoaderVisible: true,
        loaderColor: null
    }

    componentWillMount() {
        this.existingAccount = {};

        this.setState({
            pageText: this.props.navigation.state.params.pageText,
            pageColor: this.props.navigation.state.params.pageColor,
            isLoaderVisible: this.props.navigation.state.params.isLoaderVisible || true,
            loaderColor: this.props.navigation.state.params.loaderColor
        });

        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonPress);
    }

    async componentDidMount() {
        await InteractionManager.runAfterInteractions();

        const { previousPage } = this.props.navigation.state.params;

        if (previousPage === 'Login') {
            this.runSocialLoginSetup();
        }
        else if (previousPage === 'CreateUser' || previousPage === 'Activation') {
            if (previousPage === 'Activation') {
                this.existingAccount = {
                    userId: this.props.navigation.state.params.userId,
                    loginType: this.props.navigation.state.params.loginType,
                    loginId: `${this.props.navigation.state.params.loginId}`,
                    email: this.props.navigation.state.params.email
                };
            }

            this.runQallinSetup();
        }
    }

    componentWillUpdate() {
        LayoutAnimation.easeInEaseOut();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonPress);
    }

    handleBackButtonPress = () => {
        return this.state.isLoaderVisible ? true : false;
    }

    runSocialLoginSetup = async () => {
        const socialType = this.props.navigation.state.params.loginType;
        const socialData = this.props.navigation.state.params.loginData;

        if (this.props.navigation.state.params.is_social) {
            try {
                if (socialType == 'Facebook') {
                    const data = await AccessToken.getCurrentAccessToken();
                    const url = `https://graph.facebook.com/v2.12/me?access_token=${data.accessToken}&fields=id,name,gender,picture,friends{id},email`;

                    const response = await axios.get(url);

                    this.userSocialData = {
                        id: response.data.id,
                        phoneNumber: '',
                        username: response.data.name,
                        image: response.data.picture.data.url,
                        email: response.data.email,
                        token: data.accessToken,
                        tokenSecret: ''
                    };
                }
                else if (socialType == 'Google') {
                    const response = await axios.get('https://www.googleapis.com/plus/v1/people/me', {
                        params: {
                            access_token: socialData.accessToken
                        }
                    });

                    this.userSocialData = {
                        id: response.data.id,
                        phoneNumber: '',
                        username: response.data.displayName,
                        image: response.data.image.url,
                        email: response.data.emails[0].value,
                        token: '',
                        tokenSecret: ''
                    };
                }
                else if (socialType == 'Twitter') {
                    const url = 'https://api.twitter.com/1.1/users/show.json';
                    const nonce = generateNonce(32);
                    const timestamp = Math.round((new Date()).getTime() / 1000.0);

                    const parameters = {
                        oauth_consumer_key: twitterConsumerKey,
                        oauth_nonce: nonce,
                        oauth_signature_method: 'HMAC-SHA1',
                        oauth_timestamp: timestamp,
                        oauth_token: socialData.authToken,
                        oauth_version: '1.0',
                        user_id: socialData.userID
                    };

                    const signature = oauthSignature.generate(
                        'GET',
                        url,
                        parameters,
                        twitterConsumerSecret,
                        socialData.authTokenSecret
                    );
                    const authorize = `OAuth oauth_consumer_key="${twitterConsumerKey}", oauth_nonce="${nonce}", oauth_signature="${signature}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_token="${socialData.authToken}", oauth_version="1.0"`;
                    const queryUrl = `https://api.twitter.com/1.1/users/show.json?user_id=${socialData.userID}`;

                    const response = await axios.get(queryUrl, {
                        headers: {
                            'Authorization': authorize
                        }
                    });

                    this.userSocialData = {
                        id: response.data.id_str,
                        phoneNumber: '',
                        username: response.data.screen_name,
                        image: response.data.profile_image_url_https,
                        email: socialData.email || '',
                        token: socialData.authToken,
                        tokenSecret: socialData.authTokenSecret
                    };
                }
                else if (socialType == 'VK') {
                    const response = await axios.get('https://api.vk.com/method/users.get', {
                        params: {
                            fields: 'nickname, screen_name, sex, bdate, photo, photo_medium, photo_big',
                            access_token: socialData.access_token,
                            v: '5.74'
                        }
                    });

                    this.userSocialData = {
                        id: response.data.response[0].id,
                        phoneNumber: '',
                        username: response.data.response[0].nickname ? response.data.response[0].nickname : response.data.response[0].screen_name,
                        image: response.data.response[0].photo_big,
                        email: socialData.email,
                        token: '',
                        tokenSecret: ''
                    };
                }

                const oldUser = await isOldUser(`${this.userSocialData.id}`);

                if (oldUser === null) {
                    throw 'null value';
                }
                else if (oldUser && !oldUser.id && !oldUser.profileImage) {
                    await this.setState({
                        isLoading: false
                    });

                    this.props.navigation.replace('CreateUser', { userSocialData: this.userSocialData, socialType });
                }
                else {
                    if (!oldUser.deactivated) {
                        const permResp = await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                        );

                        await InteractionManager.runAfterInteractions();

                        if (permResp === 'granted') {
                            this.existingAccount = {
                                userId: oldUser.id,
                                loginType: socialType,
                                loginId: `${this.userSocialData.id}`,
                                email: this.userSocialData.email
                            };

                            const userInfo = {
                                profile_image: JSON.parse(oldUser.profileImage)
                            };

                            await AsyncStorage.setItem('@tempUserData', JSON.stringify(userInfo));

                            await this.setState({
                                pageText: I18n.t('AuthLoading/accountLoadingPageText'),
                                pageColor: Constants.colors.colorMidNight
                            });

                            this.runQallinSetup();
                        }
                        else {
                            throw 'permission denied';
                        }
                    }
                    else {
                        this.handleDeactivatedAccount({
                            ...oldUser,
                            loginType: socialType,
                            loginId: `${this.userSocialData.id}`,
                            email: this.userSocialData.email
                        });
                    }
                }
            }
            catch (error) {
                // console.error(error);

                this.handleGoBackOnError();
            }
        }
    }

    handleDeactivatedAccount = (userAccount) => {
        Alert.alert(I18n.t('AuthLoading/deactivatedAccountTitle'), I18n.t('AuthLoading/deactivatedAccountText'), [
            {
                text: I18n.t('AlertDialog/noButtonLabel'),
                onPress: () => {
                    this.props.navigation.goBack();
                }
            }, {
                text: I18n.t('AlertDialog/yesButtonLabel'),
                onPress: async () => {
                    await AsyncStorage.multiSet([
                        ['@deactivatedAccount', 'true'],
                        ['@remoteTempData', JSON.stringify(userAccount)]
                    ]);

                    this.props.navigation.replace('Activation');
                }
            }
        ], {
            cancelable: false
        });
    }

    handleGoBackOnError = () => {
        Alert.alert(I18n.t('Global/onBoardErrorTitle'), I18n.t('Global/onBoardErrorText'), [
            {
                text: I18n.t('Global/dialog/buttonLabel'),
                onPress: () => {
                    this.props.navigation.goBack();
                }
            }
        ], {
            cancelable: false
        });
    }

    setupDataStore = async () => {
        const { userCredential } = this.props.navigation.state.params;
        const { userId, loginType, loginId, email } = this.existingAccount;
        const currentTimezone = moment.tz.guess();
        const currentUtcOffset = moment().utcOffset();
        const lastActive = moment().toISOString();
        let user;
        let authenticatedUser;

        let deviceToken = await AsyncStorage.getItem('@deviceToken');

        if (deviceToken === null) {
            deviceToken = await FCM.getFCMToken();

            await AsyncStorage.setItem('@deviceToken', deviceToken);
        }

        try {
            if (userCredential) {
                let createUserData = {
                    deviceToken,
                    timezone: currentTimezone,
                    utcOffset: currentUtcOffset,
                    isVerified: true,
                    lastActive,
                    loginType,
                    loginId,
                    email,
                    ...userCredential,
                    ...this.userData
                };

                user = await createNewUser(createUserData);

                await AsyncStorage.setItem('@userID', user.id);

                authenticatedUser = await authenticateUser(user.id);

                await AsyncStorage.setItem('@apiAccessToken', authenticatedUser.token);
            }
            else {
                const apiToken = await AsyncStorage.getItem('@apiAccessToken');

                if (!apiToken) {
                    authenticatedUser = await authenticateUser(userId);

                    await AsyncStorage.setItem('@apiAccessToken', authenticatedUser.token);
                }

                const updateUserData = {
                    id: userId,
                    deviceToken,
                    deviceType: Platform.OS,
                    timezone: currentTimezone,
                    utcOffset: currentUtcOffset,
                    isVerified: true,
                    lastActive,
                    profileImage: JSON.stringify(this.userData.profile_image),
                    loginType: loginType.toLowerCase(),
                    loginId,
                    email
                };

                user = await updateUserProfile(updateUserData);

                await AsyncStorage.setItem('@userID', userId);
            }

            if (user) {
                await AsyncStorage.setItem('@initialRoute', 'MainAppScreen');

                this.props.navigation.navigate('MainAppScreen');
            }
            else {
                toggleToastNotification('messageToast', true, {
                    message: I18n.t('AuthLoading/userServerDataErrorText'),
                    textColor: '#444',
                    backgroundColor: '#fff',
                    useNativeDriver: true
                });
            }
        }
        catch (error) {
            // console.error(error);

            Alert.alert(I18n.t('AuthLoading/appSetupErrorTitle'), I18n.t('AuthLoading/appSetupErrorText'), [{
                text: I18n.t('Global/dialog/buttonLabel'),
                onPress: () => {
                    this.props.navigation.goBack();
                }
            }], {
                cancelable: false
            });
        }
    }

    async runQallinSetup() {
        const tempData = await AsyncStorage.getItem('@tempUserData');
        this.userData = JSON.parse(tempData);

        try {
            await hFS.createHipalFolders();

            if (this.userData && this.userData.profile_image) {
                if (!this.userData.profile_image.name) {
                    this.userData.profile_image.name = `profile_${hFS.getFileName(this.userData.profile_image.url)[0]}`;
                }

                let imagePath = hFS.composeAppPath(`/User/${this.userData.profile_image.name}`);

                if (hFS.isRemoteFile(this.userData.profile_image.url)) {
                    const downloadResp = await hFS.downloadFile(this.userData.profile_image.url, imagePath);

                    await AsyncStorage.setItem('@profileImage', downloadResp);
                }
                else {
                    let modPath = this.userData.profile_image.url;
                    const copyResp = await hFS.copyFile(modPath.slice(7), imagePath);
                    const uploadResp = await hFS.uploadFile(imagePath);

                    hCamera.clearCache();

                    this.userData.profile_image.url = uploadResp.url;
                    await AsyncStorage.setItem('@profileImage', copyResp);
                }
            }

            this.setupDataStore();
        }
        catch (error) {
            // console.error(error);

            const userId = await AsyncStorage.getItem('@userID');
            const user = await getAuthUserData(userId, 'local');

            if (user && user.profileImage) {
                const profileImage = JSON.parse(user.profileImage);

                if (profileImage.url && profileImage.name) {
                    const imageName = hFS.composeProfileImagePath(profileImage.name);

                    if (!hFS.pathExists(imageName, 'file')) {
                        const imagePath = hFS.composeAppPath(`/User/${profileImage.name}`);

                        const downloadResp = await hFS.downloadFile(profileImage.url, imagePath);
                    }
                }
            }
            else if (this.userData && this.userData.profile_image) {
                if (!this.userData.profile_image.name) {
                    this.userData.profile_image.name = `profile_${hFS.getFileName(this.userData.profile_image.url)[0]}`;
                }

                let imagePath = hFS.composeAppPath(`/User/${this.userData.profile_image.name}`);

                if (hFS.isRemoteFile(this.userData.profile_image.url)) {
                    const downloadResp = await hFS.downloadFile(this.userData.profile_image.url, imagePath);

                    await AsyncStorage.setItem('@profileImage', downloadResp);
                }
            }

            this.setupDataStore();
        }
    }

    render() {
        return (
            <AuthLoading
                pageText={this.state.pageText}
                pageColor={this.state.pageColor}
                isLoaderVisible={this.state.isLoaderVisible}
                loaderColor={this.state.loaderColor} />
        );
    }
};
