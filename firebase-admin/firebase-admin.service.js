// import * as serviceAccountJson from './src/environments/firebase-admin-service-account.json';
const { getApps, App, initializeApp } = require('firebase-admin/app');
const { getAuth, UserRecord } = require('firebase-admin/auth');
const { credential } = require('firebase-admin');

const initOrGetFirebaseApp = (creds) => {
    const firebaseApps = getApps();
    const firebaseApp = firebaseApps.length ? firebaseApps[0] :
        initializeApp({
            credential: credential.cert(creds)
        });

    return firebaseApp;
}

const setCustomRoles = (userIdentifier, userIdType, customClaims, credential) => {
    let getUserFn;
    const defaultAuth = getAuth(initOrGetFirebaseApp(credential));

    switch (userIdType) {
        case 'email':
            getUserFn = defaultAuth.getUserByEmail
            break;
        case 'phone':
            getUserFn = defaultAuth.getUserByPhoneNumber
            break;
        default:
            getUserFn = defaultAuth.getUser;
            break;
    }
    getUserFn = getUserFn.bind(defaultAuth);

    return new Promise((resolve, reject) => {
        getUserFn(userIdentifier)
            .then((user) => {
                // Confirm user is verified.
                if ((userIdType === 'email' && user.emailVerified) || (['id', 'phone'].includes(userIdType) && user)) {
                    // Add custom claims for additional privileges.
                    // This will be picked up by the user on token refresh or next sign in on new device.
                    getAuth().setCustomUserClaims(user.uid, customClaims).then(() => {
                        resolve(customClaims);
                    })
                        .catch((error) => {
                            reject({ status: error.status || 500, message: error.message || 'Something went wrong.' });
                        });
                } else {
                    reject({ status: 401, message: error.message || 'Unauthorized - Email is not verified.' });
                }
            })
            .catch((error) => {
                reject({ status: error.status || 404, message: error.message || 'User does not exist.' });
            });
    })
}

module.exports = { initOrGetFirebaseApp, setCustomRoles };
