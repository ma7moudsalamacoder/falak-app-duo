import Echo from "laravel-echo";
import Ably from "ably";
import api from "./api";

/**
 * Realtime (Ably via Laravel Echo/Broadcasting).
 *
 * Private/presence channels are authorized by Laravel's broadcasting auth
 * route (default: POST /broadcasting/auth), which must see the same
 * X-API-Key + Authorization: Bearer <user token> headers as every other
 * request — so we point Echo's authorizer at the shared `api` axios client
 * instead of letting it make a bare fetch/XHR of its own.
 *
 * Backend needs (config/broadcasting.php):
 *   'default' => 'ably',
 *   'connections' => ['ably' => ['driver' => 'ably', 'key' => env('ABLY_KEY')]]
 * and BroadcastServiceProvider registered so /broadcasting/auth exists.
 */

let echo = null;

export function connect() {
  if (echo) return echo;

  echo = new Echo({
    broadcaster: "ably",
    key: import.meta.env.VITE_ABLY_PUBLIC_KEY, // Ably key's public/client half only
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        api
          .post("/broadcasting/auth", {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then(({ data }) => callback(false, data))
          .catch((err) => callback(true, err));
      },
    }),
  });

  return echo;
}

export function disconnect() {
  echo?.disconnect();
  echo = null;
}

/** Subscribe to a public channel, e.g. listenPublic('orders', '.OrderUpdated', cb) */
export function listenPublic(channelName, eventName, callback) {
  return connect().channel(channelName).listen(eventName, callback);
}

/** Subscribe to a private channel scoped to the current user, e.g. `App.Models.User.5` */
export function listenPrivate(channelName, eventName, callback) {
  return connect().private(channelName).listen(eventName, callback);
}

/** Subscribe to a presence channel (who's online), e.g. a shared room */
export function joinPresence(channelName, { here, joining, leaving } = {}) {
  const presence = connect().join(channelName);
  if (here) presence.here(here);
  if (joining) presence.joining(joining);
  if (leaving) presence.leaving(leaving);
  return presence;
}
