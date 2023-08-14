const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '../../../.env')
});
const request = require('request');

const MICROSOFT = {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    redirectUri: process.env.MICROSOFT_REDIRECT_URI,
    LINKS: {
        login: 'https://login.live.com/oauth20_authorize.srf',
        liveToken: 'https://login.live.com/oauth20_token.srf',
        authenticate: 'https://user.auth.xboxlive.com/user/authenticate',
        xstsToken: 'https://xsts.auth.xboxlive.com/xsts/authorize',
        minecraftToken: 'https://api.minecraftservices.com/authentication/login_with_xbox',
        minecraftOwnership: 'https://api.minecraftservices.com/entitlements/mcstore',
        minecraftProfile: 'https://api.minecraftservices.com/minecraft/profile'
    }
};

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

const microsoftApi = {
    getToken (code) {
        const url = MICROSOFT.LINKS.liveToken;

        return new Promise((resolve, reject) => {
            request({
                url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                form: {
                    client_id: MICROSOFT.clientId,
                    client_secret: MICROSOFT.clientSecret,
                    code,
                    redirect_uri: MICROSOFT.redirectUri,
                    grant_type: 'authorization_code'
                },
                json: true
            }, (err, res, body) => {
                if(err) reject(err);

                resolve(body);
            });
        });
    },

    authenticate(accessToken) {
        const url = MICROSOFT.LINKS.authenticate;

        return new Promise((resolve, reject) => {
            request({
                url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: {
                    Properties: {
                        AuthMethod: 'RPS',
                        SiteName: 'user.auth.xboxlive.com',
                        RpsTicket: `d=${accessToken}`
                    },
                    RelyingParty: 'http://auth.xboxlive.com',
                    TokenType: 'JWT'
                },
                json: true
            }, (err, res, body) => {
                if(err) reject(err);

                resolve(body);
            });
        });
    },

    getXstsToken(accessToken) {
        const url = MICROSOFT.LINKS.xstsToken;

        return new Promise((resolve, reject) => {
            request({
                url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: {
                    Properties: {
                        SandboxId: 'RETAIL',
                        UserTokens: [
                            accessToken
                        ]
                    },
                    RelyingParty: 'rp://api.minecraftservices.com/',
                    TokenType: 'JWT'
                },
                json: true
            }, (err, res, body) => {
                if(err) reject(err);

                resolve(body);
            });
        });
    },

    getMinecraftToken (userHash, xstsToken) {
        const url = MICROSOFT.LINKS.minecraftToken;

        return new Promise((resolve, reject) => {
            request({
                url,
                method: 'POST',
                body: {
                    identityToken: `XBL3.0 x=${userHash};${xstsToken}`,
                    ensureLegacyEnabled: true
                },
                json: true
            }, (err, res, body) => {
                if(err) reject(err);

                resolve(body);
            });
        });
    },

    getMinecraftOwnership (token) {
        const url = MICROSOFT.LINKS.minecraftOwnership;

        return new Promise((resolve, reject) => {
            request({
                url,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                json: true
            }, (err, res, body) => {
                if(err) reject(err);

                resolve(body);
            });
        });
    },

    getMinecraftProfile (token) {
        const url = MICROSOFT.LINKS.minecraftProfile;

        return new Promise((resolve, reject) => {
            request({
                url,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                json: true
            }, (err, res, body) => {
                if(err) reject(err);

                resolve(body);
            });
        });
    }
};

function getMicrosoftAuthLink(req, res) {
    res.send({
        success: true,
        authURL: `${MICROSOFT.LINKS.login}?client_id=${MICROSOFT.clientId}&redirect_uri=${MICROSOFT.redirectUri}&scope=XboxLive.signin%20offline_access&state=NOT_NEEDED&response_type=code&cobrandid=8058f65d-ce06-4c30-9559-473c9275a65d`
    });
}

async function processMicrosoftAuth(req, res) {
    // it's getting the auth code from params
    const { code } = req.params;

    // it's getting microsoft token from code
    const microsoftAccessTokenRequest = await microsoftApi.getToken(code);
    const microsoftAccessToken = microsoftAccessTokenRequest.access_token;

    // it's authenticating to xbox live using microsoft access token
    const xboxAuthenticationRequest = await microsoftApi.authenticate(microsoftAccessToken);
    const xboxLiveToken = xboxAuthenticationRequest.Token;
    const xboxLiveUHS = xboxAuthenticationRequest.DisplayClaims.xui[0].uhs;

    // it's getting the xsts token
    const xstsTokenRequest = await microsoftApi.getXstsToken(xboxLiveToken);
    const xstsToken = xstsTokenRequest.Token;

    // it's getting minecraft token
    const minecraftTokenRequest = await microsoftApi.getMinecraftToken(xboxLiveUHS, xstsToken);
    const minecraftToken = minecraftTokenRequest.access_token;

    // it's getting minecraft ownership
    const minecraftOwnershipRequest = await microsoftApi.getMinecraftOwnership(minecraftToken);

    // it's checking minecraft ownership
    const hasMinecraftJavaEdition = minecraftOwnershipRequest.items.some((item) => item.name === 'game_minecraft');
    if (!hasMinecraftJavaEdition) return res.send({
        success: false,
        error: {
            message: {
                fr: 'Votre compte ne contient pas Minecraft: Java Edition !',
                en: 'Your account does not possess Minecraft: Java Edition!'
            }
        }
    });

    // it's getting minecraft client id
    const minecraftItem = minecraftOwnershipRequest.items.find((item) => item.name === 'game_minecraft');
    const minecraftItemDecoded = parseJwt(minecraftItem.signature);
    const clientId = minecraftItemDecoded.signerId;

    // it's getting minecraft profile
    const minecraftProfileRequest = await microsoftApi.getMinecraftProfile(minecraftToken);

    // it's returning account data
    res.send({
        success: true,
        userData: {
            clientId,
            minecraftToken,
            profile: {
                id: minecraftProfileRequest.id,
                name: minecraftProfileRequest.name
            }
        }
    });
}

module.exports = {
    getMicrosoftAuthLink,
    processMicrosoftAuth
};
