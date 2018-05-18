const Constants = require('~/config/constants');

import React, { Component } from 'react';
import { StyleSheet, Animated, View, Text } from 'react-native';
import { qallinEvents } from '~/utils/helpers';

export default class MessageToast extends Component {
	state = {
		isVisible: false,
		message: '',
		textColor: Constants.colors.textColor,
		backgroundColor: Constants.colors.colorPrimary,
		animatedValue: new Animated.Value(0)
	}

	componentDidMount() {
		this.toastEvents = qallinEvents.addListener('messageToast', this.handleToastEvents);
	}

	componentWillUnmount() {
		this.toastEvents && this.toastEvents.remove();
	}

	handleToastEvents = async (props) => {
		if (props) {
			await this.setState(prevState => ({
				isVisible: true,
				message: props.message,
				textColor: props.textColor || prevState.textColor,
				backgroundColor: props.backgroundColor || prevState.backgroundColor
			}));

			setTimeout(() => this.showMessageToast(props), 20);
		}
	}

	showMessageToast(props) {
		const duration = props.duration ? (props.duration === 'short' ? 6500 : 12500) : 6500;

		Animated.timing(this.state.animatedValue, {
			toValue: 70,
			duration: 400,
			useNativeDriver: props.useNativeDriver || false
		}).start(() => setTimeout(() => this.hideMessageToast(props), duration));
	}

	hideMessageToast(props) {
		Animated.timing(this.state.animatedValue, {
			toValue: 0,
			duration: 400,
			useNativeDriver: props.useNativeDriver || false
		}).start(() => this.setState({
			isVisible: false,
			message: '',
			textColor: Constants.colors.textColor,
			backgroundColor: Constants.colors.colorPrimary
		}));
	}

	render() {
		const { isVisible, message, textColor, backgroundColor, animatedValue } = this.state;

		if (!isVisible) {
			return null;
		}

		return (
			<Animated.View style={[styles.background, { backgroundColor, transform: [{ translateY: animatedValue }] }]}>
				<Text
					style={[styles.textMessage, { color: textColor} ]}
					numberOfLines={4}
					ellipsizeMode='tail'>
					{message}
				</Text>
			</Animated.View>
		);
	}
}


const styles = StyleSheet.create({
	background: {
		position: 'absolute',
		minHeight: 40,
        padding: 5,
        marginTop: 5,
        borderRadius: 5,
        alignSelf: 'center',
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
		padding: 8,
		fontSize: 13,
		maxWidth: 220,
		textAlign: 'center'
	}
});
