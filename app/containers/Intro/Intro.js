const Constants = require('~/config/constants');

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StatusBar, StyleSheet, View, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AppIntroSlider from 'react-native-app-intro-slider';
import { Button } from 'react-native-elements';
import I18n from 'react-native-i18n';

export default class Intro extends Component {
	static propTypes = {
		contents: PropTypes.arrayOf(PropTypes.object).isRequired,
		onMoveToNextPage: PropTypes.func.isRequired
	}

	renderSliderItems = (item) => {
		return (
			<View key={item.key} style={[styles.slide, { width: item.width, height: item.height, backgroundColor: item.backgroundColor }]}>
				<View style={{ marginVertical: 10 }} level={15}>
					<Image
						source={item.image}
						style={{ width: 120, height: 120 }} />
				</View>

				<View style={{ marginHorizontal: 20 }} level={8}>
					<View>
						<Text style={styles.slideTitle}>{item.title}</Text>
					</View>

					<View>
						<Text style={styles.slideDescription}>{item.text}</Text>
					</View>
				</View>
			</View>
		);
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				<View style={{ flex: 1 }}>
					<StatusBar
						animated={true}
						backgroundColor={Constants.statusbar.colorDefault}
						translucent={true} />

					<AppIntroSlider
						slides={this.props.contents}
						renderItem={this.renderSliderItems}
						dotColor='rgba(128, 128, 128, 0.7)'
						showPrevButton={false}
						hideNextButton={true}
						showSkipButton={false}
						hideDoneButton={true} />
				</View>

				<View style={{ position: 'absolute', bottom: 10, alignSelf: 'center', alignItems: 'center' }}>
					<Button
						title={I18n.t('Intro/introButtonText')}
						accessibilityLabel={I18n.t('Intro/introButtonAccessibilityLabel')}
						raised={true}
		                backgroundColor='#fff'
		                containerViewStyle={{ position: 'absolute', bottom: 75 }}
		                buttonStyle={{ borderRadius: 3 }}
		                textStyle={styles.buttonText}
						onPress={this.props.onMoveToNextPage} />
				</View>
			</View>
		);
	}
}


/* creating styles for elements contained in the intro page */
const styles = StyleSheet.create({
	slide: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingBottom: 50
	},

	slideTitle: {
		color: Constants.colors.textColor,
		fontSize: 30,
		fontWeight: 'bold',
		marginVertical: 10,
		textAlign: 'center'
	},

	slideDescription: {
		color: '#fff',
		fontSize: 15,
		fontWeight: 'normal',
		textAlign: 'center'
	},

	buttonText: {
		color: Constants.colors.colorMidNight,
		fontSize: 17,
		fontWeight: 'bold'
	}
});
