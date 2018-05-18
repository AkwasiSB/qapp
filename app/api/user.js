import gql from 'graphql-tag';
import { QApiClient, QLocalDB } from './setup';


export const isUserAuthed = async () => {
	const user = await QApiClient.query({
      	query: gql`
		    query UserQuery {
				user {
				    id
				}
			}
		`
    });

    return user ? user.data.user : null;
}


export const authenticateUser = async (userId) => {
	const user = await QApiClient.mutate({
        mutation: gql`
            mutation authenticateQUserMutation($id: ID!) {
                authenticateQUser(id: $id) {
                    token
                }
            }
        `,
        variables: {
        	id: userId
        },
    });

    return user ? user.data.authenticateQUser : null;
}


export const isOldUser = async (loginId) => {
	const user = await QApiClient.query({
      	query: gql`
		    query UserQuery($loginId: String!) {
				User(loginId: $loginId) {
				    id
                    username
				    profileImage
                    deactivated
				}
			}
		`,
      	variables: { loginId },
    });

    return user ? (user.data.User ? user.data.User : {}) : null;
}


export const getAuthUserData = async (userId, storageType) => {
    if (storageType && storageType === 'local') {
        const user = QLocalDB.objects('User').filtered('id = $0', userId)[0];

        return user;
    }

    const user = await QApiClient.query({
        query: gql`
            query UserQuery($id: ID!) {
                User(id: $id) {
                    id
                    phoneNumber
                    profileImage
                    status
                    username
                    email
                    lastActive
                    settings
                    createdAt
                    updatedAt
                    slug
                    deactivated
                }
            }
        `,
        variables: {
            id: userId
        },
    });

    if (user && user.data.User) {
        QLocalDB.write(() => {
            QLocalDB.create('User', {
                ...user.data.User
            }, true);
        });
    }
}


export const createNewUser = async (data) => {
	let user = await QApiClient.mutate({
        mutation: gql`
            mutation createUserMutation(
                $deviceToken: String,
                $deviceType: String,
                $phoneNumber: String,
                $profileImage: String,
                $status: String,
                $username: String!,
                $isVerified: Boolean!,
                $loginType: String!,
                $loginId: String!,
                $lastActive: DateTime,
                $email: String
            ) {
                createUser(
                    deviceToken: $deviceToken,
                    deviceType: $deviceType,
                    phoneNumber: $phoneNumber,
                    profileImage: $profileImage,
                    status: $status,
                    username: $username,
                    isVerified: $isVerified,
                    loginType: $loginType,
                    loginId: $loginId,
                    lastActive: $lastActive,
                    email: $email
                ) {
                    id
                    username
                    createdAt
                    updatedAt
                    profileImage
                    slug
                    deactivated
                }
            }
        `,
        variables: {
            deviceToken: data.deviceToken,
            deviceType: data.deviceType,
            phoneNumber: data.phoneNumber,
            profileImage: JSON.stringify(data.profile_image),
            status: data.status,
            username: data.username,
            isVerified: data.isVerified,
            loginType: data.loginType.toLowerCase(),
            loginId: `${data.id}`,
            lastActive: data.lastActive,
            email: data.email
        },
    });

	if (user && user.data.createUser) {
		delete data['profile_image'];

        QLocalDB.write(() => {
            QLocalDB.create('User', {
            	...data,
            	...user.data.createUser
            });
        });
    }

	return user ? user.data.createUser : null;
}


export const updateUserProfile = async (data) => {
	let user = await QApiClient.mutate({
        mutation: gql`
            mutation updateUserMutation(
                $id: ID!,
                $deviceToken: String,
                $deviceType: String,
                $lastActive: DateTime,
                $email: String
            ) {
                updateUser(
                    id: $id,
                    deviceToken: $deviceToken,
                    deviceType: $deviceType,
                    lastActive: $lastActive,
                    email: $email
                ) {
                    id
                    username
                    status
                    createdAt
                    updatedAt
                    settings
                    slug
                    deactivated
                }
            }
        `,
        variables: {
            id: data.id,
            deviceToken: data.deviceToken,
            deviceType: data.deviceType,
            lastActive: data.lastActive,
            email: data.email
        },
    });

    if (user && user.data.updateUser) {
        QLocalDB.write(() => {
            QLocalDB.create('User', {
            	...data,
            	...user.data.updateUser
            }, true);
        });
    }

	return user ? user.data.updateUser : null;
}


export const updateUserBasicProfile = async (data) => {
	const user = await QApiClient.mutate({
        mutation: gql`
            mutation updateUserMutation(
                $id: ID!,
                $phoneNumber: String,
                $status: String,
                $username: String!
            ) {
                updateUser(
                    id: $id,
                    phoneNumber: $phoneNumber,
                    status: $status,
                    username: $username
                ) {
                    id
                    updatedAt
                    slug
                }
            }
        `,
        variables: {
            id: data.id,
            phoneNumber: data.phoneNumber,
            status: data.status,
            username: data.username
        },
    });

	if (user && user.data.updateUser) {
        QLocalDB.write(() => {
            QLocalDB.create('User', {
            	...data,
            	...user.data.updateUser
            }, true);
        });
    }
}


export const updateUserImage = async (data) => {
	const user = await QApiClient.mutate({
        mutation: gql`
            mutation updateUserMutation(
                $id: ID!,
                $profileImage: String
            ) {
                updateUser(
                    id: $id,
                    profileImage: $profileImage
                ) {
                    id
                    updatedAt
                }
            }
        `,
        variables: {
            id: data.id,
            profileImage: data.profileImage
        },
    });

    if (user && user.data.updateUser) {
    	QLocalDB.write(() => {
            QLocalDB.create('User', {
            	...data,
            	...user.data.updateUser
            }, true);
        });
    }
}


export const updateUserSettings = async (data) => {
    const user = await QApiClient.mutate({
        mutation: gql`
            mutation updateUserMutation(
                $id: ID!,
                $settings: String
            ) {
                updateUser(
                    id: $id,
                    settings: $settings
                ) {
                    id
                    updatedAt
                }
            }
        `,
        variables: {
            id: data.id,
            settings: data.settings
        },
    });

    if (user && user.data.updateUser) {
    	QLocalDB.write(() => {
            QLocalDB.create('User', {
            	...data,
            	...user.data.updateUser
            }, true);
        });
    }
}


export const updateUserPresence = async (userId, lastActive) => {
	const user = await QApiClient.mutate({
        mutation: gql`
            mutation updateUserMutation(
                $id: ID!,
                $lastActive: DateTime
            ) {
                updateUser(
                    id: $id,
                	lastActive: $lastActive
                ) {
                	id
                    updatedAt
                    lastActive
                }
            }
        `,
        variables: {
            id: userId,
            lastActive
        },
    });

    if (user && user.data.updateUser) {
    	QLocalDB.write(() => {
            QLocalDB.create('User', {
            	...user.data.updateUser
            }, true);
        });
    }
}


export const updateUserDeviceToken = async (userId, deviceToken) => {
    const user = await QApiClient.mutate({
        mutation: gql`
            mutation updateUserMutation(
                $id: ID!,
                $deviceToken: String
            ) {
                updateUser(
                    id: $id,
                    deviceToken: $deviceToken
                ) {
                	id
                    updatedAt
                    deviceToken
                }
            }
        `,
        variables: {
            id: userId,
            deviceToken
        },
    });

    if (user && user.data.updateUser) {
    	QLocalDB.write(() => {
            QLocalDB.create('User', {
            	...user.data.updateUser
            }, true);
    	});
    }
}


export const updateAccountDeactivation = async (data) => {
    const existingUser  = QLocalDB.objects('User').filtered('id = $0', data.id)[0];

    const user = await QApiClient.mutate({
        mutation: gql`
            mutation updateUserMutation(
                $id: ID!,
                $deactivated: Boolean
            ) {
                updateUser(
                    id: $id,
                    deactivated: $deactivated
                ) {
                    id
                    updatedAt
                }
            }
        `,
        variables: {
            id: data.id,
            deactivated: data.deactivated
        },
    });

    if (!existingUser.id) {
        return;
    }

    if (user && user.data.updateUser) {
        QLocalDB.write(() => {
            QLocalDB.create('User', {
                ...data,
                ...user.data.updateUser
            }, true);
        });
    }
}
