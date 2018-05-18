const Constants = require('~/config/constants');

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Platform, StyleSheet, Animated, View, TextInput } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { QallinButton } from '~/components';
import { qallinEvents } from '~/utils/helpers';

export class SearchBarHeader extends Component {
    static propTypes = {
        placeholder: PropTypes.string,
        textColor: PropTypes.string,
        backgroundColor: PropTypes.string,
        placeholderTextColor: PropTypes.string,
        onStartSearch: PropTypes.func,
        onGetSearchValue: PropTypes.func
    }

    state = {
        searchValue: ''
    }

    handleChangeText = (value) => {
        this.props.onStartSearch(value);

        this.setState({
            searchValue: value
        });
    }

    handleClearSearchInput = () => {
        this.props.onStartSearch('');

        this.searchBarRef.clear();

        this.setState({
            searchValue: ''
        });
    }

    render() {
        return (
            <View style={[styles.searchBarHeader, { justifyContent: 'center', backgroundColor: this.props.backgroundColor }]}>
                <TextInput
                    ref={ref => this.searchBarRef = ref}
                    placeholder={this.props.placeholder}
                    placeholderTextColor={this.props.placeholderTextColor || Constants.colors.placeholderTextColor}
                    underlineColorAndroid={this.props.backgroundColor}
                    returnKeyType='search'
                    blurOnSubmit={false}
                    autoCapitalize='none'
                    autoCorrect={false}
                    autoFocus={true}
                    selectionColor={this.props.textColor || Constants.colors.textColor}
                    style={[styles.textInput, { color: this.props.textColor || Constants.colors.textColor }]}
                    onChangeText={this.handleChangeText}
                    onSubmitEditing={this.props.onGetSearchValue} />
    
                {this.state.searchValue.length > 0
                    && <MaterialIcon
                        name='close'
                        size={24}
                        style={[styles.clearIcon, { color: this.props.placeholderTextColor || Constants.colors.placeholderTextColor }]}
                        onPress={this.handleClearSearchInput} />}
            </View>
        );
    }
}


export class SearchBarOverlay extends Component {
    static propTypes = {
        onStartSearch: PropTypes.func,
        onGetSearchValue: PropTypes.func,
        onCloseSearchBarOVerlay: PropTypes.func
    }

    state = {
        searchValue: '',
        placeholder: '',
        textColor: null,
        backgroundColor: null,
        placeholderTextColor: null,
        animatedValue: new Animated.Value(-56)
    }

    componentDidMount() {
        this.searchBarEvents = qallinEvents.addListener('searchBarOVerlay', this.handleSearchBarEvents);
    }

    componentWillUnmount() {
        this.searchBarEvents && this.searchBarEvents.remove();
    }

    handleSearchBarEvents = async (props) => {
        if (props) {
            await this.setState({
                placeholder: props.placeholder,
                textColor: props.textColor,
                backgroundColor: props.backgroundColor,
                placeholderTextColor: props.placeholderTextColor,
                useNativeDriver: props.useNativeDriver
            });

            this.onStartSearch = (value) => props.onStartSearch(value);
            this.onGetSearchValue = () => props.onGetSearchValue();
            this.onCloseSearchBarOVerlay = () => props.onCloseSearchBarOVerlay();

            this.handleShowSeachBarOverlay(props);
        }
    }

    handleShowSeachBarOverlay(props) {
        Animated.timing(this.state.animatedValue, {
            toValue: 0,
            duration: 50,
            useNativeDriver: props.useNativeDriver || false
        }).start(() => this.searchBarRef.focus());
    }

    handleChangeText = (value) => {
        this.onStartSearch(value);

        this.setState({
            searchValue: value
        });
    }

    handleClearSearchInput = () => {
        this.onStartSearch('');

        this.searchBarRef.clear();

        this.setState({
            searchValue: ''
        });
    }

    handleCloseSearchBarOVerlay = () => {
        this.handleClearSearchInput();

        Animated.timing(this.state.animatedValue, {
            toValue: -56,
            duration: 0,
            useNativeDriver: this.state.useNativeDriver || false
        }).start(this.searchBarRef.blur());

        this.onCloseSearchBarOVerlay();
    }

    render() {
        return (
            <Animated.View style={[styles.searchBarOverlay, { transform: [{ translateY: this.state.animatedValue }], backgroundColor: this.state.backgroundColor || '#fff' }]}>
                <QallinButton onButtonPress={this.handleCloseSearchBarOVerlay}>
                    <MaterialIcon
                        name='arrow-back'
                        size={24}
                        style={{ paddingHorizontal: 15, color: this.state.textColor || Constants.colors.defaultTextColor }} />
                </QallinButton>

                <TextInput
                    ref={ref => this.searchBarRef = ref}
                    placeholder={this.state.placeholder}
                    placeholderTextColor={this.state.placeholderTextColor || Constants.colors.defaultPlaceholderTextColor}
                    underlineColorAndroid={this.state.backgroundColor || '#fff'}
                    returnKeyType='search'
                    blurOnSubmit={false}
                    autoCapitalize='none'
                    autoCorrect={false}
                    autoFocus={false}
                    selectionColor={this.state.textColor || Constants.colors.defaultTextColor}
                    style={[styles.overlayTextInput, { color: this.state.textColor || Constants.colors.defaultTextColor }]}
                    onChangeText={this.handleChangeText}
                    onSubmitEditing={this.onGetSearchValue} />
    
                {this.state.searchValue.length > 0
                    && <MaterialIcon
                        name='close'
                        size={24}
                        style={[styles.overlayClearIcon, { color: this.state.placeholderTextColor || Constants.colors.defaultPlaceholderTextColor }]}
                        onPress={this.handleClearSearchInput} />}
            </Animated.View>
        );
    }
}


const styles = StyleSheet.create({
    overlayContainer: {
        justifyContent: 'flex-start',
        marginHorizontal: 0,
        marginTop: 0
    },

    searchBarHeader: {
        flex: 1,
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },

    searchBarOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        elevation: 1,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 5,
        shadowOpacity: 0.3
    },

    textInput: {
        fontSize: 17,
        paddingRight: 40
    },

    overlayTextInput: {
        fontSize: 17,
        width: '74%'
    },

    clearIcon: {
        position: 'absolute',
        right: 10,
        bottom: 15
    },

    overlayClearIcon: {
        width: 40,
        textAlign: 'center',
        paddingHorizontal: 5
    }
});
