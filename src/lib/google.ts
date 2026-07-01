import { google } from "googleapis";
import { config } from "./config";
import { channelStore, type ConnectedChannel } from "./store";

export function createOAuthClient() {
  return new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.redirectUri
  );
}

export function buildAuthUrl(state: string) {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline", // required to receive a refresh_token
    prompt: "consent select_account", // always show account chooser so a
    // different Google account/channel can be picked -> this is what makes
    // "connect another channel" work for multi-channel support
    scope: config.scopes,
    state
  });
}

/**
 * Returns an OAuth2 client authenticated for the given connected channel,
 * transparently refreshing the access token if it has expired and
 * persisting the new token back to the store.
 */
export async function getAuthorizedClient(channel: ConnectedChannel) {
  const client = createOAuthClient();
  client.setCredentials({
    access_token: channel.accessToken,
    refresh_token: channel.refreshToken,
    expiry_date: channel.expiryDate
  });

  if (Date.now() >= channel.expiryDate - 60_000) {
    const { credentials } = await client.refreshAccessToken();
    channelStore.updateTokens(channel.id, {
      accessToken: credentials.access_token || channel.accessToken,
      expiryDate: credentials.expiry_date || Date.now() + 55 * 60 * 1000,
      refreshToken: credentials.refresh_token || undefined
    });
    client.setCredentials(credentials);
  }

  return client;
}
