/**
 * Q v.1.0.0 - React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

require('../I18n/I18n.js');

import React, { Component } from 'react';
import { Linking, NetInfo, AppState, Platform, InteractionManager, AsyncStorage, View } from 'react-native';
import I18n from 'react-native-i18n';
import { ApolloProvider } from 'react-apollo';
import moment from 'moment-timezone';
import { SafeAreaView, NavigationActions } from 'react-navigation';
import FCM, { FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType } from 'react-native-fcm';
import { AppBarToast, MessageToast, SearchBarOverlay } from '~/components';
import { QApiClientInit, QLocalDBInit } from '~/api/setup';
import { isUserAuthed, authenticateUser, getAuthUserData, updateUserTimeZone, updateUserDeviceToken, updateUserPresence } from '~/api/user';
import { toggleToastNotification, isOnboardPage } from '~/utils/helpers';

/* configure I18n globally for app user */
I18n.fallbacks = true;
I18n.defaultSeparator = '/';

import { Screens } from '~/config/router';

if (Platform.OS === 'android') {
    SafeAreaView.setStatusBarHeight(0);
}

/* Main app class */
export default class App extends Component {
	async componentWillMount() {
		this.QApiClient = QApiClientInit();
		await QLocalDBInit();
	}

	async componentDidMount() {
        if (Platform.OS === 'ios') {
			FCM.requestPermissions();
		}

		this.handleDeepLinkingPage();

		this.userId = await AsyncStorage.getItem('@userID');

        this.initialConnectionAvailable = await NetInfo.isConnected.fetch();

		if (this.userId && this.initialConnectionAvailable) {
        	FCM.subscribeToTopic('q_global_notification');

			const refreshedAuthToken = await this.refreshUserAuthToken();

			if (refreshedAuthToken) {
				this.handleUserTimeZone();
	    		this.handleRefreshDeviceToken();

	    		this.presenceInterval = setInterval(async () => {
	    			await this.handleUserPresence();
	    		}, 60000);
			}
		}

        if (!this.initialConnectionAvailable) {
            toggleToastNotification('appBarToast', true, {
                message: I18n.t('Global/noNetwork'),
                isWarning: true,
                currentRouteName: this.currentRouteName
            });
        }

		NetInfo.addEventListener('connectionChange', this.handleConnectivityChange);
		AppState.addEventListener('change', this.handleAppStateChange);
    }

    componentWillUnmount() {
    	Linking.removeEventListener('url', this.handleLinkingUrl);
    	NetInfo.removeEventListener('connectionChange', this.handleConnectivityChange);
    	AppState.removeEventListener('change', this.handleAppStateChange);

    	this.presenceInterval && clearInterval(this.presenceInterval);

        this.refreshTokenListener && this.refreshTokenListener.remove();
    }

    handleConnectivityChange = async ({ type }) => {
    	if (type === 'none' || type === 'unknown') {
    		this.presenceInterval && clearInterval(this.presenceInterval);

    		toggleToastNotification('appBarToast', true, {
    			message: I18n.t('Global/noNetwork'),
    			isWarning: true,
                currentRouteName: this.currentRouteName
    		});
    	}
    	else {
    		toggleToastNotification('appBarToast', false);

            FCM.subscribeToTopic('q_global_notification');

            if (this.userId && !this.initialConnectionAvailable) {
                this.initialConnectionAvailable = await NetInfo.isConnected.fetch();

                const refreshedAuthToken = await this.refreshUserAuthToken();

                if (refreshedAuthToken) {
                    this.handleUserTimeZone();
                    this.handleRefreshDeviceToken();

                    this.presenceInterval = setInterval(async () => {
                        await this.handleUserPresence();
                    }, 60000);
                }
            }
            else {
                if (this.userId) {
                    const refreshedAuthToken = await this.refreshUserAuthToken();

                    if (refreshedAuthToken) {
                        this.presenceInterval = setInterval(async () => {
                            await this.handleUserPresence();
                        }, 60000);
                    }
                }
            }
    	}
    }

    handleAppStateChange = (appState) => {
    	if (appState.match(/inactive|background/)) {
    		
    	}
    }

    parseLinkingUrl = (url) => {
    	const pathElems = url.split('/');
        let page = pathElems[pathElems.length - 1];
        page = page.charAt(0).toUpperCase() + page.slice(1);

        return page;
    }

    handleLinkingUrl = (event) => {
    	this.parseLinkingUrl(event.url);
    }

    handleDeepLinkingPage = async () => {
    	Linking.addEventListener('url', this.handleLinkingUrl);

    	try {
	        /* deep-linking the app with links from external sources */
	        const url = await Linking.getInitialURL();

            if (url) {
               	const page = this.parseLinkingUrl(url);

                this.appPageInit(page);
            }
            else {
                this.appPageInit();
            }
        }
        catch (error) {
            this.appPageInit();
        }
    }

	appPageInit = async (deepLinkPage) => {
        const onBoardNavigateAction = NavigationActions.navigate({
            type: NavigationActions.NAVIGATE,
            routeName: 'OnBoardScreen'
        });

        try {
	        /* Get apps initial route from storage and if it doesn't exists or error
	           then go to OnBoard page */
	        const initialRoute = await AsyncStorage.getItem('@initialRoute');

            if (initialRoute) {
	            /* if app is opened by a deep link and not part of the onboarding
	               pages go there and if not go to the route stored in storage */
               const initialRouteNavigateAction = NavigationActions.navigate({
                    type: NavigationActions.NAVIGATE,
                    routeName: (deepLinkPage && !isOnboardPage(deepLinkPage))
                        ? deepLinkPage : initialRoute
                });

	            this.navigationRef.dispatch(initialRouteNavigateAction);
	        }
	        else {
                this.navigationRef.dispatch(onBoardNavigateAction);
	        }
        }
        catch (error) {
            this.navigationRef.dispatch(onBoardNavigateAction);
        }
    }

    refreshUserAuthToken = async () => {
    	try {
        	const user = await isUserAuthed();

            if (user === null) {
            	const authenticatedUser = await authenticateUser(this.userId);

                if (!authenticatedUser) {
                	return false;
                }

                await AsyncStorage.setItem('@apiAccessToken', authenticatedUser.token);
	        }

	        await getAuthUserData(this.userId);

	        return true;
        }
        catch (error) {
            return false;
        }
    }

    handleUserTimeZone = async () => {
    	try {
    		const timeData = {
				utcOffset: moment().utcOffset(),
				timezone: moment.tz.guess()
			};

            await updateUserTimeZone(this.userId, timeData);
        }
        catch (error) {
            console.error(error);
        }
    }

    handleRefreshDeviceToken = async () => {
    	this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, async (token) => {
		    if (token) {
		        try {
		        	await AsyncStorage.setItem('@deviceToken', token);

			        await updateUserDeviceToken(this.userId, token);
				}
			    catch (error) {
	        		console.error(error);
	        	}
		    }
		});
    }

    handleUserPresence = async () => {
    	try {
            await updateUserPresence(this.userId, moment());
        }
        catch (error) {
            console.error(error);
        }
    }

    handleNavigationStateChange = async (prevState, nextState) => {
        await InteractionManager.runAfterInteractions();

        this.currentRouteName = nextState.routes[nextState.index].routeName;
    }

    render() {
    	return (
        	<View style={{ flex: 1 }}>
		        <AppBarToast />

				<MessageToast />

	        	<ApolloProvider client={this.QApiClient}>
		        	<Screens
                        ref={ref => this.navigationRef = ref}
                        onNavigationStateChange={this.handleNavigationStateChange} />
		        </ApolloProvider>

                <SearchBarOverlay />
		    </View>
        );
    }
}
