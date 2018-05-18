const Constants = require('~/config/constants');

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, StatusBar, View, Text, Image, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-elements';
import I18n from 'react-native-i18n';
import defaultImage from '../../assets/image-placeholder.png';

export default class Activation extends Component {
    static propTypes = {
        imageUrl: PropTypes.oneOfType([
            PropTypes.shape({ uri: PropTypes.string }),
            PropTypes.number
        ]),
        username: PropTypes.string.isRequired,
        isAccountActivating: PropTypes.bool.isRequired,
        onActivateUserAccount: PropTypes.func.isRequired
    }

    state = {
        isImageLoaderVisible: 0
    }

    handleStartImageLoading = async (progress) => {
        await this.setState({
            isImageLoaderVisible: progress === 'start' ? 1 : 0
        });
    }

	render() {
        return (
            <View style={styles.mainContainer}>
                <StatusBar
                    animated={true}
                    backgroundColor={Constants.statusbar.colorPrimary}
                    translucent={false} />

               	<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '500', color: Constants.colors.colorPrimary, marginVertical: 25 }}>
                        {I18n.t('Activation/activateSubtitle')}
                    </Text>

                    <View style={styles.imageContainer}>
                        <Image
                            source={this.props.imageUrl || defaultImage}
                            resizeMode='cover'
                            resizeMethod='scale'
                            onLoadStart={() => this.handleStartImageLoading('start')}
                            onLoadEnd={() => this.handleStartImageLoading('end')}
                            style={{ width: 118, height: 118, borderRadius: 120 }} />

                        <ActivityIndicator
                            style={{ position: 'absolute', opacity: this.state.isImageLoaderVisible }}
                            animating={true}
                            size='large'
                            color={Constants.colors.colorPrimary} />
                    </View>

                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: Constants.colors.colorPrimary, marginVertical: 25 }}>
                        {this.props.username}
                    </Text>

                    <Button
                        title={I18n.t('Activation/activateButtonLabel')}
                        accessibilityLabel={I18n.t('Activation/activateAccessibilityLabel')}
                        raised={true}
                        iconRight={!this.props.isAccountActivating ? { type: 'font-awesome', color: Constants.colors.colorPrimary, size: 15, name: 'long-arrow-right' } : null}
                        loading={this.props.isAccountActivating}
                        backgroundColor='transparent'
                        color={Constants.colors.colorPrimary}
                        activityIndicatorStyle={{ marginHorizontal: 0, marginRight: 5 }}
                        disabledStyle={{ backgroundColor: 'transparent' }}
                        containerViewStyle={styles.activateButtonContainer}
                        buttonStyle={{ borderRadius: 3 }}
                        textStyle={[styles.buttonText, { color: Constants.colors.colorPrimary }]}
                        onPress={this.props.onActivateUserAccount} />
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },

    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },

    activateButtonContainer: {
        minWidth: 110,
        borderWidth: 1,
        borderRadius: 3,
        marginTop: 25,
        borderColor: Constants.colors.colorPrimary
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        alignSelf: 'center',
        fontWeight: 'bold'
    }
});
