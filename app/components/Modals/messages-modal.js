const Constants = require('~/config/constants');

import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import I18n from 'react-native-i18n';

MessagesModal.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	title: PropTypes.string.isRequired,
	onCloseModalPress: PropTypes.func.isRequired
};

export default function MessagesModal(props) {
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
			<View style={{ backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 20 }}>
				{props.title
					? <View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Text style={{ fontSize: 19, fontWeight: '500' }}>
							{props.title}
						</Text>
					</View>
					: null}

				<ScrollView style={{ paddingVertical: 15 }}>
					{props.children}
				</ScrollView>

				<View style={{ flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 8 }}>
					<TouchableOpacity
						style={{ paddingHorizontal: 10, marginRight: 5 }}
						onPress={props.onCloseModalPress}>
						<Text style={{ fontSize: 14.5, fontWeight: '500', color: Constants.colors.colorMidNight }}>
							{I18n.t('MessagesModal/okButtonLabel')}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}
