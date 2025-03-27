import { Request, Response } from "express";
import path from "path";
import request from "request";
import dotenv from "dotenv";
import {
  generateCodeChallenger,
  generateCodeVerifier,
} from "../../utils/ms-code-verifier";
import { errorBuilder } from "../../utils/errorBuilder";
dotenv.config({
  path: path.join(__dirname, "../../../.env"),
});

const MICROSOFT = {
  clientId: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  redirectUri: process.env.MICROSOFT_REDIRECT_URI,
  LINKS: {
    login: "https://login.live.com/oauth20_authorize.srf",
    liveToken: "https://login.live.com/oauth20_token.srf",
    authenticate: "https://user.auth.xboxlive.com/user/authenticate",
    xstsToken: "https://xsts.auth.xboxlive.com/xsts/authorize",
    minecraftToken:
      "https://api.minecraftservices.com/authentication/login_with_xbox",
    minecraftOwnership:
      "https://api.minecraftservices.com/entitlements/mcstore",
    minecraftProfile: "https://api.minecraftservices.com/minecraft/profile",
  },
};

function parseJwt(token: string) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
}

const microsoftApi = {
  getToken(code: string, codeVerifier: string): Promise<any> {
    const url = MICROSOFT.LINKS.liveToken;

    console.log(codeVerifier);

    return new Promise((resolve, reject) => {
      request(
        {
          url,
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          form: {
            client_id: MICROSOFT.clientId,
            client_secret: MICROSOFT.clientSecret,
            code,
            redirect_uri: MICROSOFT.redirectUri,
            grant_type: "authorization_code",
            code_verifier: codeVerifier,
          },
          json: true,
        },
        (err: any, res: any, body: string) => {
          console.log(body);
          if (err) reject(err);

          resolve(body);
        }
      );
    });
  },

  authenticate(accessToken: string): Promise<any> {
    const url = MICROSOFT.LINKS.authenticate;

    return new Promise((resolve, reject) => {
      request(
        {
          url,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: {
            Properties: {
              AuthMethod: "RPS",
              SiteName: "user.auth.xboxlive.com",
              RpsTicket: `d=${accessToken}`,
            },
            RelyingParty: "http://auth.xboxlive.com",
            TokenType: "JWT",
          },
          json: true,
        },
        (err: any, res: any, body: string) => {
          if (err) reject(err);

          resolve(body);
        }
      );
    });
  },

  getXstsToken(accessToken: string): Promise<any> {
    const url = MICROSOFT.LINKS.xstsToken;

    return new Promise((resolve, reject) => {
      request(
        {
          url,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: {
            Properties: {
              SandboxId: "RETAIL",
              UserTokens: [accessToken],
            },
            RelyingParty: "rp://api.minecraftservices.com/",
            TokenType: "JWT",
          },
          json: true,
        },
        (err: any, res: any, body: string) => {
          if (err) reject(err);

          resolve(body);
        }
      );
    });
  },

  getMinecraftToken(userHash: string, xstsToken: string): Promise<any> {
    const url = MICROSOFT.LINKS.minecraftToken;

    return new Promise((resolve, reject) => {
      request(
        {
          url,
          method: "POST",
          body: {
            identityToken: `XBL3.0 x=${userHash};${xstsToken}`,
            ensureLegacyEnabled: true,
          },
          json: true,
        },
        (err: any, res: any, body: string) => {
          if (err) reject(err);

          resolve(body);
        }
      );
    });
  },

  getMinecraftOwnership(token: string): Promise<any> {
    const url = MICROSOFT.LINKS.minecraftOwnership;

    return new Promise((resolve, reject) => {
      request(
        {
          url,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          json: true,
        },
        (err: any, res: any, body: string) => {
          if (err) reject(err);

          resolve(body);
        }
      );
    });
  },

  getMinecraftProfile(token: string): Promise<any> {
    const url = MICROSOFT.LINKS.minecraftProfile;

    return new Promise((resolve, reject) => {
      request(
        {
          url,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          json: true,
        },
        (err: any, res: any, body: string) => {
          if (err) reject(err);

          resolve(body);
        }
      );
    });
  },
};

export function getMicrosoftAuthLink(req: Request, res: Response) {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenger(codeVerifier);

  (req.session as any).codeVerifier = codeVerifier;
  console.log(req.get("host"));

  res.redirect(
    `${MICROSOFT.LINKS.login}?client_id=${MICROSOFT.clientId}&redirect_uri=${MICROSOFT.redirectUri}&scope=XboxLive.signin%20offline_access&state=NOT_NEEDED&response_type=code&code_challenge_method=S256&code_challenge=${codeChallenge}`
  );
}

export async function processMicrosoftAuth(req: Request, res: Response) {
  // it's getting the auth code from params
  const { code } = req.params;
  const codeVerifier = (req.session as any).codeVerifier;

  if (!codeVerifier)
    return res.send(
      errorBuilder({
        en: "An error has occurred while trying to get the session code verifier.",
        fr: "Une erreur est survenue lors de la recuperation du token de verification dans la session.",
      })
    );

  // it's getting microsoft token from code
  const microsoftAccessTokenRequest = await microsoftApi.getToken(
    code,
    codeVerifier
  );
  const microsoftAccessToken = microsoftAccessTokenRequest.access_token;

  // it's authenticating to xbox live using microsoft access token
  const xboxAuthenticationRequest =
    await microsoftApi.authenticate(microsoftAccessToken);

  const xboxLiveToken = xboxAuthenticationRequest.Token;
  const xboxLiveUHS = xboxAuthenticationRequest.DisplayClaims.xui[0].uhs;

  // it's getting the xsts token
  const xstsTokenRequest = await microsoftApi.getXstsToken(xboxLiveToken);
  const xstsToken = xstsTokenRequest.Token;

  // it's getting minecraft token
  const minecraftTokenRequest = await microsoftApi.getMinecraftToken(
    xboxLiveUHS,
    xstsToken
  );
  const minecraftToken = minecraftTokenRequest.access_token;

  // it's getting minecraft ownership
  const minecraftOwnershipRequest =
    await microsoftApi.getMinecraftOwnership(minecraftToken);

  // it's checking minecraft ownership
  const hasMinecraftJavaEdition = minecraftOwnershipRequest.items.some(
    (item: any) => item.name === "game_minecraft"
  );
  if (!hasMinecraftJavaEdition)
    return res.send({
      success: false,
      error: {
        message: {
          fr: "Votre compte ne contient pas Minecraft: Java Edition !",
          en: "Your account does not possess Minecraft: Java Edition!",
        },
      },
    });

  // it's getting minecraft client id
  const minecraftItem = minecraftOwnershipRequest.items.find(
    (item: any) => item.name === "game_minecraft"
  );
  const minecraftItemDecoded = parseJwt(minecraftItem.signature);
  const clientId = minecraftItemDecoded.signerId;

  // it's getting minecraft profile
  const minecraftProfileRequest =
    await microsoftApi.getMinecraftProfile(minecraftToken);

  // it's returning account data
  res.send({
    success: true,
    userData: {
      clientId,
      minecraftToken,
      profile: {
        id: minecraftProfileRequest.id,
        name: minecraftProfileRequest.name,
      },
    },
  });
}

export function hostRedirect(req: Request, res: Response) {
  const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  const urlObject = new URL(fullUrl);
  const searchParams = new URLSearchParams(urlObject.search);
  const code = searchParams.get("code");
  res.redirect("/auth/microsoft/process-auth/" + code);
}
