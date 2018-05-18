import { AsyncStorage } from 'react-native';
import { ApolloClient } from 'apollo-client';
import { ApolloLink, from } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import Realm from 'realm';
import { qServerUri } from '~/config/constants';


export let QApiClient = null;

export const QApiClientInit = () => {
	const httpLink = new HttpLink({
		uri: qServerUri
	});

	const authMiddleware = setContext(async (req, { headers = {} }) => {
		const token = await AsyncStorage.getItem('@apiAccessToken');

		return {
			headers: {
				...headers,
				authorization: token ? `Bearer ${token}` : null
			}
		};
	});

	const apolloClient = new ApolloClient({
		link: from([authMiddleware, httpLink]),
		cache: new InMemoryCache({
			dataIdFromObject: r => r.id
		})
	});

	QApiClient = apolloClient;

	return apolloClient;
}

 
// app local database
export let QLocalDB = null;

export const QLocalDBInit = async () => {
	const userSchema = {
		name: 'User',
		primaryKey: 'id',
		properties: {
			createdAt: 'string',
		  	deviceToken: {type: 'string', default: null, optional: true},
		  	deviceType: {type: 'string', default: null, optional: true},
		  	id: 'string',
		  	lastActive: 'string',
		  	phoneNumber: {type: 'string', indexed: true, default: '', optional: true},
		  	profileImage: {type: 'string', default: null, optional: true},
		  	status: {type: 'string', default: '', optional: true},
		  	updatedAt: 'string',
		  	username: 'string',
		  	settings: {type: 'string', default: null, optional: true},
		  	isVerified: {type: 'bool', default: false},
		  	loginId: {type: 'string', default: '', optional: true},
		  	loginType: {type: 'string', default: '', optional: true},
		  	slug: {type: 'string', indexed: true, default: '', optional: true},
		  	deactivated: {type: 'bool', default: false, optional: true},
		  	email: {type: 'string', default: '', optional: true}
		}
	};

	try {
		const realmDB = await Realm.open({
			schema: [userSchema]
		});

		QLocalDB = realmDB;
	}
	catch (error) {
		console.error(error);
	}
}
