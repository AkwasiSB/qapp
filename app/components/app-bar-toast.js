import React, { Component } from 'react';
import { StyleSheet, Animated, View, Text } from 'react-native';
import { qallinEvents } from '~/utils/helpers';

export default class AppBarToast extends Component {
	state = {
		isVisible: false,
		message: '',
		isWarning: false,
		useNativeDriver: false,
		animatedValue: new Animated.Value(-70)
	}

	componentDidMount() {
		this.toastEvents = qallinEvents.addListener('appBarToast', this.handleToastEvents);
	}

	componentWillUnmount() {
		this.toastEvents && this.toastEvents.remove();
	}

	handleToastEvents = async (props) => {
		if (props && props.currentRouteName === 'MainAppScreen') {
			await this.setState({
				isVisible: true,
				message: props.message,
				isWarning: props.isWarning,
				useNativeDriver: props.useNativeDriver ? props.useNativeDriver : false
			});

			setTimeout(() => this.showToastNotification(), 20);
		}
		else {
			this.state.isVisible && this.hideToastNotification();
		}
	}

	showToastNotification = () => {
		const { useNativeDriver, animatedValue } = this.state;

		Animated.timing(animatedValue, {
			toValue: 0,
			duration: 0,
			useNativeDriver
		}).start();
	}

	hideToastNotification = () => {
		const { useNativeDriver, animatedValue } = this.state;

		Animated.timing(animatedValue, {
			toValue: -70,
			duration: 0,
			useNativeDriver
		}).start(() => this.setState({
			isVisible: false,
			message: '',
			useNativeDriver: false
		}));
	}

	render() {
		const { isVisible, message, isWarning, animatedValue } = this.state;

		if (!isVisible) {
			return null;
		}

		return (
			<View style={[styles.background, { backgroundColor: isWarning ? '#cc4125' : '#1e91b1' }]}>
				<Animated.Text
					style={[styles.textMessage, { transform: [{ translateY: animatedValue }] }]}
					numberOfLines={1}
					ellipsizeMode='tail'>
					{message}
				</Animated.Text>
			</View>
		);
	}
}


const styles = StyleSheet.create({
	background: {
		height: 25,
        padding: 5,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 5,
        shadowOpacity: 0.3,
        elevation: 5
	},

	textMessage: {
		marginHorizontal: 5,
		fontSize: 14,
		color: 'white',
		textAlign: 'center'
	}
});
