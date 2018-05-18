const Constants = require('~/config/constants');

import React, { Component } from 'react';
import { InteractionManager, AsyncStorage, LayoutAnimation, Alert, PermissionsAndroid} from 'react-native';
import I18n from 'react-native-i18n';
import { authenticateUser, getAuthUserData, updateAccountDeactivation } from '~/api/user';
import { hFS } from '~/utils/device-services';
import { toggleToastNotification } from '~/utils/helpers';
import Activation from './Activation';

export default class ActivationContainer extends Component {
    state = {
        imageUrl: null,
        username: '',
        isAccountActivating: false
    }

    async componentDidMount() {
        await InteractionManager.runAfterInteractions();

        const storageValues = await AsyncStorage.multiGet(['@userID', '@remoteTempData']);
        this.userId = storageValues[0][1];
        this.userAccount = JSON.parse(storageValues[1][1]);

        if (this.userId) {
            const user = await getAuthUserData(this.userId, 'local');
            const profileImage = user.profileImage && JSON.parse(user.profileImage);

            await this.setState({
                imageUrl: profileImage ? { uri: hFS.composeProfileImagePath(profileImage.name) } : null,
                username: user.username
            });
        }
        else {
            const profileImage = this.userAccount.profileImage && JSON.parse(this.userAccount.profileImage);

            await this.setState({
                imageUrl: profileImage ? { uri: profileImage.url } : null,
                username: this.userAccount.username
            });
        }
    }

    componentWillUpdate() {
        LayoutAnimation.easeInEaseOut();
    }

    handleActivateUserAccount = async () => {
        await this.setState({
            isAccountActivating: true
        });

        try {
            if (this.userId) {
                const authenticatedUser = await authenticateUser(this.userId);

                if (authenticatedUser) {
                    await AsyncStorage.multiSet([
                        ['@apiAccessToken', authenticatedUser.token],
                        ['@initialRoute', 'MainAppScreen']
                    ]);

                    const updateUserData = {
                        id: this.userId,
                        deactivated: false
                    };

                    await updateAccountDeactivation(updateUserData);

                    await AsyncStorage.removeItem('@deactivatedAccount');

                    await this.setState({
                        isAccountActivating: false
                    });

                    this.props.navigation.navigate('MainAppScreen');
                }
                else {
                    await this.setState({
                        isAccountActivating: false
                    });

                    Alert.alert(I18n.t('Global/onBoardErrorTitle'), I18n.t('Global/onBoardErrorText'), [
                        { text: I18n.t('Global/dialog/buttonLabel') }
                    ], {
                        cancelable: false
                    });
                }
            }
            else {
                const userId = this.userAccount.id;
                const authenticatedUser = await authenticateUser(userId);

                if (authenticatedUser) {
                    await AsyncStorage.setItem('@apiAccessToken', authenticatedUser.token);

                    const permResp = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                    );

                    if (permResp === 'granted') {
                        const updateUserData = {
                            id: userId,
                            deactivated: false
                        };

                        await updateAccountDeactivation(updateUserData);

                        await AsyncStorage.multiRemove(['@deactivatedAccount', '@remoteTempData']);

                        const pageInfo = {
                            userId,
                            loginType: this.userAccount.loginType,
                            loginId: `${this.userAccount.loginId}`,
                            email: this.userAccount.email,
                            pageText: I18n.t('AuthLoading/accountLoadingPageText'),
                            pageColor: Constants.colors.colorMidNight,
                            previousPage: 'Activation'
                        };

                        const userInfo = {
                            profile_image: JSON.parse(this.userAccount.profileImage)
                        };

                        await AsyncStorage.setItem('@tempUserData', JSON.stringify(userInfo));

                        await this.setState({
                            isAccountActivating: false
                        });

                        this.props.navigation.navigate('AuthLoading', pageInfo);
                    }
                }
                else {
                    await this.setState({
                        isAccountActivating: false
                    });

                    Alert.alert(I18n.t('Global/onBoardErrorTitle'), I18n.t('Global/onBoardErrorText'), [
                        { text: I18n.t('Global/dialog/buttonLabel') }
                    ], {
                        cancelable: false
                    });
                }
            }
        }
        catch (error) {
            // console.error(error);

            await this.setState({
                isAccountActivating: false
            });

            toggleToastNotification('messageToast', true, {
                message: I18n.t('Activation/activationErrorText'),
                textColor: '#fff',
                backgroundColor: Constants.colors.colorPrimary,
                useNativeDriver: true
            });
        }
    }

    render() {
        return (
            <Activation
                imageUrl={this.state.imageUrl}
                username={this.state.username}
                isAccountActivating={this.state.isAccountActivating}
                onActivateUserAccount={this.handleActivateUserAccount} />
        );
    }
}
