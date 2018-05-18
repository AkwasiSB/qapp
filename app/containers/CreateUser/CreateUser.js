const Constants = require('~/config/constants');

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StatusBar, StyleSheet, ScrollView, View, Image, Text, ActivityIndicator } from 'react-native';
import { Button, Icon as IconButton } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';
import I18n from 'react-native-i18n';
import { PickerModal } from '~/components';
import defaultImage from '../../assets/image-placeholder.png';

export default class CreateUser extends Component {
	static propTypes = {
		titleSpacing: PropTypes.number.isRequired,
		subTitle: PropTypes.string.isRequired,
		hideImageSize: PropTypes.number.isRequired,
		imageSpacing: PropTypes.number.isRequired,
		imageUrl: PropTypes.oneOfType([
			PropTypes.shape({ uri: PropTypes.string }),
			PropTypes.number
		]),
		onStartImageLoading: PropTypes.func.isRequired,
		isImageLoaderVisible: PropTypes.number.isRequired,
		usernameValue: PropTypes.string.isRequired,
		statusValue: PropTypes.string.isRequired,
		onGetTextValue: PropTypes.func.isRequired,
		onCreateUserProfile: PropTypes.func.isRequired,
		isButtonDisabled: PropTypes.bool.isRequired,
		isPickerModalVisible: PropTypes.bool.isRequired,
		onTogglePickerModalVisibility: PropTypes.func.isRequired,
		onGetUserProfileImage: PropTypes.func.isRequired
	}

	render() {
		return (
			<View style={styles.mainContainer}>
				<StatusBar
					animated={true}
					backgroundColor={Constants.statusbar.colorDefault}
					translucent={true} />

				<View style={{ marginBottom: 20 }}>
					<Text style={styles.pageTitle}>{I18n.t('CreateUser/title')}</Text>
				</View>

				<View style={[styles.subTitleContainer, { marginBottom: this.props.titleSpacing }]}>
					<Text style={styles.pageSubTile}>{this.props.subTitle}</Text>
				</View>

				<ScrollView
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.childContainer}>
					<View style={{ flexDirection: 'row' }}>
						<View style={[styles.imageContainer, { width: this.props.hideImageSize, height: this.props.hideImageSize, marginBottom: this.props.imageSpacing }]}>
							<Image
								source={this.props.imageUrl || defaultImage}
								resizeMode='cover'
								resizeMethod='scale'
								style={{ width: 118, height: 118, borderRadius: 120 }}
								onLoadStart={() => this.props.onStartImageLoading('start')}
								onLoadEnd={() => this.props.onStartImageLoading('end')} />

							<ActivityIndicator
								style={{ position: 'absolute', opacity: this.props.isImageLoaderVisible }}
								animating={true}
								size='large'
								color={Constants.colors.colorSecondary} />
						</View>

						<IconButton
                			type='font-awesome'
                			name='camera'
                			size={15}
                			raised={true}
                			color={Constants.colors.textColor}
                			underlayColor={Constants.colors.colorPrimary}
                			containerStyle={{ backgroundColor: Constants.colors.colorPrimary, position: 'absolute', left: 79, bottom: 12, width: 40, height: 40, borderRadius: 20 }}
                			onPress={this.props.onTogglePickerModalVisibility} />
					</View>

					<View style={styles.editContainer}>
						<TextField
                            name={I18n.t('CreateUser/usernameLabel').toLowerCase()}
                            type='TextInput'
                            label={I18n.t('CreateUser/usernameLabel')}
							value={this.props.usernameValue}
                            textColor={Constants.colors.textColor}
                            baseColor='#aaa'
                            tintColor={Constants.colors.textColor}
							maxLength={25}
                            autoCapitalize='none'
                            autoCorrect={false}
                            returnKeyType='next'
							onChangeText={(text) => this.props.onGetTextValue(text, 'inputUsername')}
                            onSubmitEditing={() => this.textInputRef.focus()} />
					</View>

					<View style={styles.editContainer}>
						<TextField
							ref={(ref) => this.textInputRef = ref}
                            name={I18n.t('CreateUser/statusLabel').toLowerCase()}
                            type='TextInput'
                            label={I18n.t('CreateUser/statusLabel')}
							value={this.props.statusValue}
                            textColor={Constants.colors.textColor}
                            baseColor='#aaa'
                            tintColor={Constants.colors.textColor}
							maxLength={25}
                            autoCapitalize='none'
                            autoCorrect={false}
                            returnKeyType='done'
							onChangeText={(text) => this.props.onGetTextValue(text, 'inputStatus')}
                            onSubmitEditing={this.props.onCreateUserProfile} />
					</View>

					<Button
			            title={I18n.t('CreateUser/createUserButtonLabel')}
			            accessibilityLabel={I18n.t('CreateUser/createUserAcessibilityLabel')}
			            raised={true}
						disabled={this.props.isButtonDisabled}
			            backgroundColor='transparent'
			            disabledStyle={{ backgroundColor: 'transparent' }}
			            containerViewStyle={[styles.buttonContainer, { borderColor: this.props.isButtonDisabled ? '#aaa' : Constants.colors.defaultTextColor }]}
			            buttonStyle={{ borderRadius: 3 }}
			            textStyle={[styles.buttonText, { color: this.props.isButtonDisabled ? '#aaa' : Constants.colors.defaultTextColor}]}
			            onPress={this.props.onCreateUserProfile} />
				</ScrollView>

                <PickerModal
                	isVisible={this.props.isPickerModalVisible}
                	title={I18n.t('ImagePicker/title')}
                	pickerItems={[I18n.t('ImagePicker/item1'), I18n.t('ImagePicker/item2'), I18n.t('ImagePicker/item3')]}
                	onValueSelected={this.props.onGetUserProfileImage}
                	onCloseModalPress={this.props.onTogglePickerModalVisibility} />
			</View>
		);
	}
}


const styles = StyleSheet.create({
	mainContainer: {
        flex: 1,
		backgroundColor: Constants.colors.colorSecondary,
		paddingTop: 40,
		paddingHorizontal: 12
	},

	childContainer: {
		justifyContent: 'center',
		alignItems: 'center'
	},

	imageContainer: {
		borderRadius: 60,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center'
	},

	pageTitle: {
		color: Constants.colors.textColor,
		fontSize: 20,
		fontWeight: 'bold'
	},

	pageSubTile: {
		color: '#fff',
		fontSize: 13,
		textAlign: 'center'
	},

	subTitleContainer: {
		justifyContent: 'center',
		alignItems: 'center'
	},

	editContainer: {
		flex: 1,
		width: 285
	},

	buttonContainer: {
        minWidth: 110,
		borderWidth: 1,
		borderRadius: 3,
		marginTop: 35
	},

	buttonText: {
		fontSize: 16,
		fontWeight: 'bold'
	}
});
