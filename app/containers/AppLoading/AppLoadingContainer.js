import PropTypes from 'prop-types';
import React, { Component } from 'react';
import AppLoading from './AppLoading';

export default class AppLoadingContainer extends Component {
    /* set default component state values */
    state = {
        pageColor: '#fff',
        isLoaderVisible: true,
        loaderColor: null
    }

    render() {
        return (
            <AppLoading
                pageColor={this.state.pageColor}
                isLoaderVisible={this.state.isLoaderVisible}
                loaderColor={this.state.loaderColor} />
        );
    }
};
