'use strict';

import React, { PropTypes, PureComponent } from 'react';
import ReactNative, { requireNativeComponent, View } from 'react-native';

const {
    NativeModules: { UIManager, CrosswalkWebViewManager: { JSNavigationScheme } }
} = ReactNative;

const resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource');

const WEBVIEW_REF = 'crosswalkWebView';

class CrosswalkWebView extends PureComponent {
    constructor(props) {
        super(props);
        this.statics = JSNavigationScheme;
        this.onProgress = this.onProgress.bind(this);
        this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
        this.onProgress = this.onProgress.bind(this);
        this.onError = this.onError.bind(this);
        this.onMessage = this.onMessage.bind(this);
    }


    render() {
        const source = this.props.source || {};
        if (this.props.url) {
            source.uri = this.props.url;
        }
        const nativeProps = Object.assign({}, this.props, {
            messagingEnabled:                        typeof this.props.onMessage === 'function',
            onCrosswalkWebViewNavigationStateChange: this.onNavigationStateChange,
            onCrosswalkWebViewError:                 this.onError,
            onCrosswalkWebViewProgress:              this.onProgress
        });
        return (
            <NativeCrosswalkWebView
                {...nativeProps}
                ref={WEBVIEW_REF}
                source={resolveAssetSource(source)} />
        );
    }

    getWebViewHandle() {
        return ReactNative.findNodeHandle(this.refs[WEBVIEW_REF]);
    }

    onNavigationStateChange(event) {
        const { onNavigationStateChange } = this.props;
        if (onNavigationStateChange) {
            onNavigationStateChange(event.nativeEvent);
        }
    }

    onError(event) {
        const { onError } = this.props;
        if (onError) {
            onError(event.nativeEvent);
        }
    }

    onProgress(event) {
        const { onProgress } = this.props;
        if (onProgress) {
            onProgress(event.nativeEvent.progress / 100);
        }
    }

    goBack() {
        UIManager.dispatchViewManagerCommand(
            this.getWebViewHandle(),
            UIManager.CrosswalkWebView.Commands.goBack,
            null
        );
    }

    goForward() {
        UIManager.dispatchViewManagerCommand(
            this.getWebViewHandle(),
            UIManager.CrosswalkWebView.Commands.goForward,
            null
        );
    }

    reload() {
        UIManager.dispatchViewManagerCommand(
            this.getWebViewHandle(),
            UIManager.CrosswalkWebView.Commands.reload,
            null
        );
    }

    postMessage(data) {
        UIManager.dispatchViewManagerCommand(
            this.getWebViewHandle(),
            UIManager.CrosswalkWebView.Commands.postMessage,
            [String(data)]
        );
    }

    onMessage(event) {
        const { onMessage } = this.props;
        onMessage && onMessage(event);
    }
}

CrosswalkWebView.propTypes = {
    injectedJavaScript:      PropTypes.string,
    localhost:               PropTypes.bool.isRequired,
    onError:                 PropTypes.func,
    onMessage:               PropTypes.func,
    onNavigationStateChange: PropTypes.func,
    onProgress:              PropTypes.func,
    source:                  PropTypes.oneOfType([
        PropTypes.shape({
            uri: PropTypes.string,  // URI to load in WebView
        }),
        PropTypes.shape({
            html: PropTypes.string, // static HTML to load in WebView
        }),
        PropTypes.number,           // used internally by React packager
    ]),
    url:                     PropTypes.string,
    ...View.propTypes
};

CrosswalkWebView.defaultProps = {
    localhost: false
};


const NativeCrosswalkWebView = requireNativeComponent('CrosswalkWebView', CrosswalkWebView, {
    nativeOnly: {
        messagingEnabled: PropTypes.bool,
    },
});

export default CrosswalkWebView;
