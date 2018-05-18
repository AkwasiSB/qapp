const Constants = require('~/config/constants');

import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import I18n from 'react-native-i18n';

PickerModal.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	title: PropTypes.string,
	pickerItems: PropTypes.array.isRequired,
	onValueSelected: PropTypes.func,
	onCloseModalPress: PropTypes.func.isRequired
};

export default function PickerModal(props) {
	return(
		<Modal
			isVisible={props.isVisible}
			useNativeDriver={true}
			animationIn='fadeIn'
			animationOut='fadeOut'
			animationOutTiming={300}
			backdropTransitionOutTiming={300}
			onBackdropPress={props.onCloseModalPress}
			onBackButtonPress={props.onCloseModalPress}
			hideModalContentWhileAnimating={true}>
			<View style={[styles.modalContainer, { paddingTop: props.title ? 13 : 5 }]}>
				{props.title
					? <View style={styles.titleContainer}>
						<Text style={styles.title}>
							{props.title}
						</Text>
					</View>
					: null}

				<ScrollView>
					<View style={{ marginVertical: 5 }}>
						{props.pickerItems.map((value, index) => (
							<TouchableOpacity
								key={value instanceof Object ? value.id : index}
								style={{ paddingVertical: 10 }}
								onPress={() => props.onValueSelected(index, value)}>
								<Text style={{ fontSize: 15.5, fontWeight: '400' }}>
									{value instanceof Object ? value.title : value}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>
			</View>
		</Modal>
	);
}


const styles = StyleSheet.create({
	modalContainer: {
		backgroundColor: '#fff',
		paddingHorizontal: 18,
		paddingBottom: 5
	},

	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center'
	},

	title: {
		fontSize: 19,
		fontWeight: '500'
	}
});
