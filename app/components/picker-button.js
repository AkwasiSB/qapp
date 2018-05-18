const Constants = require('~/config/constants');

import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

PickerButton.propTypes = {
	containerStyle: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.array,
		PropTypes.object
	]),
	pickerValue: PropTypes.string,
	isIndicatorVisible: PropTypes.bool,
	onPickerButtonPress: PropTypes.func
};

export default function PickerButton(props) {
	return (
		<TouchableOpacity
			style={props.containerStyle}
			onPress={props.onPickerButtonPress}>
			<View style={styles.viewContainer}>
				<Text style={{ paddingHorizontal: 5 }}>
					{props.pickerValue}
				</Text>

				{props.isIndicatorVisible
					? <Icon
						name='arrow-drop-down'
						size={20}
						color={Constants.colors.colorMidNight}
						style={styles.indicator} />
					: null}
			</View>
		</TouchableOpacity>
	);
}

PickerButton.defaultProps = {
	isIndicatorVisible: true
};


const styles = StyleSheet.create({
	viewContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingTop: 8,
		paddingBottom: 3,
		borderBottomWidth: 1,
		borderColor: Constants.colors.colorMidNight
	},

	indicator: {
		position: 'absolute',
		right: 0,
		bottom: 3
	}
});
