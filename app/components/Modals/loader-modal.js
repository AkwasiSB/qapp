const Constants = require('~/config/constants');

import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';

LoaderModal.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	loaderColor: PropTypes.string,
	loaderText: PropTypes.string,
	loaderTextColor: PropTypes.string,
	numberOfLines: PropTypes.number
};

export default function LoaderModal(props) {
	return(
		<Modal
			isVisible={props.isVisible}
			useNativeDriver={true}
			animationIn='fadeIn'
			animationOut='fadeOut'
			animationOutTiming={300}
			backdropTransitionOutTiming={300}
			hideModalContentWhileAnimating={true}>
			<View style={styles.mainLoaderContainer}>
				<ActivityIndicator
					animating={true}
					size={25}
					color={props.loaderColor} />

				{props.loaderText
					? <Text
						numberOfLines={props.numberOfLines || 3}
						style={[styles.loaderText, { color: props.loaderTextColor }]}>
						{props.loaderText}
					</Text>
					: null}
			</View>
		</Modal>
	);
}


const styles = StyleSheet.create({
    mainLoaderContainer: {
        justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
		paddingHorizontal: 20,
		paddingVertical: 20,
		marginHorizontal: 35,
	},

	loaderText: {
		color: Constants.colors.defaultTextColor,
		fontSize: 15,
		marginTop: 13,
		textAlign: 'center'
	}
});
