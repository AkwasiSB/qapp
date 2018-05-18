const Constants = require('~/config/constants');

import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, StatusBar, View, ActivityIndicator, Text } from 'react-native';

AuthLoading.propTypes = {
	pageText: PropTypes.string.isRequired,
	pageColor: PropTypes.string.isRequired,
	isLoaderVisible: PropTypes.bool,
	loaderColor: PropTypes.string
};

export default function AuthLoading(props) {
	return (
		<View style={[styles.maincontainer, { backgroundColor: props.pageColor }]}>
			<StatusBar
				animated={true}
				backgroundColor={Constants.statusbar.colorDefault}
				translucent={true} />

			<ActivityIndicator
				animating={props.isLoaderVisiblee}
				size='large'
				color={props.loaderColor || Constants.colors.textColor} />

			<Text
				numberOfLines={2}
				style={styles.indicatorText}>
				{props.pageText}
			</Text>
		</View>
	);
}


/* create styles for the loader page */
const styles = StyleSheet.create({
    maincontainer: {
        flex: 1,
        justifyContent: 'center',
		alignItems: 'center'
	},

	indicatorText: {
		color: Constants.colors.textColor,
		fontSize: 15,
		textAlign: 'center',
		marginVertical: 15,
		marginHorizontal: 15
	}
});
