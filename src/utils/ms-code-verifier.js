const crypto = require("crypto");

module.exports = {
  generateCodeVerifier() {
    return crypto.randomBytes(32).toString("base64url");
  },
  generateCodeChallenger(codeVerifier) {
    return crypto.createHash("sha256").update(codeVerifier).digest("base64url");
  },
};
