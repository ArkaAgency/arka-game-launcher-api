import { Session, SessionData } from "express-session";

declare module "express-session" {
  interface SessionData {
    codeVerifier: string;
  }
  interface Session {
    codeVerifier: string;
  }
}
