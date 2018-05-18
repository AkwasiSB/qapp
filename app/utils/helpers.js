import { EventEmitter } from 'fbemitter';

export const qEvents = new EventEmitter();


export const toggleToastNotification = (type, show, data) => {
	qEvents.emit(type, show ? data : null);
}


export const toggleSearchBarOverlay = (data) => {
	qEvents.emit('searchBarOVerlay', data);
}


export const isOnboardPage = (routeName) => {
	const isOnboard = [
		'Intro',
		'Login',
		'Activation',
		'CreateUser',
		'AuthLoading'
	].includes(routeName);

	return isOnboard;
}


/* generate a nonce token for oauth 1.0 */
export const generateNonce = (length) => {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}
