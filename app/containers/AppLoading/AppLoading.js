const Constants = require('~/config/constants');

import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, StatusBar, View, ActivityIndicator, Text } from 'react-native';

AppLoading.propTypes = {
	pageColor: PropTypes.string.isRequired,
	isLoaderVisible: PropTypes.bool.isRequired,
	loaderColor: PropTypes.string
};

export default function AppLoading(props) {
	return (
		<View style={[styles.maincontainer, { backgroundColor: props.pageColor }]}>
			<StatusBar
				animated={true}
				backgroundColor={Constants.statusbar.colorDefault}
				translucent={true} />

			<ActivityIndicator
				animating={props.isLoaderVisible}
				size='large'
				color={props.loaderColor || Constants.colors.textColor} />
		</View>
	);
}


/* create styles for the loader page */
const styles = StyleSheet.create({
    maincontainer: {
        flex: 1,
        justifyContent: 'center',
		alignItems: 'center'
	}
});
