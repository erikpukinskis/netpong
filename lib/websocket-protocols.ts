const UUID_FORMAT = /^[0-9a-f]+-[0-9a-f]+-[0-9a-f]+-[0-9a-f]+-[0-9a-f]+$/;

/**
 * Proxy Protocol
 **/

const PROXY_PROTOCOL_FORMAT = /^proxy--(.+)--(.+)$/;

export function ProxyProtocol(registerAsId: string, subscribeToId: string) {
  return `proxy--${registerAsId}--${subscribeToId}`;
}

type ProxyProtocolString = `proxy--${string}--${string}`;

export function isProxyProtocol(
  protocol: string | null
): protocol is ProxyProtocolString {
  return typeof protocol === "string" && PROXY_PROTOCOL_FORMAT.test(protocol);
}

export function parseProxyProtocol(protocol: string | null) {
  if (typeof protocol !== "string") {
    throw new Error(
      `Cannot parse ${protocol} as ProxyProtocol because it is not a string. Try using ProxyProtocol() to generate the protocol.`
    );
  }
  const match = protocol.match(PROXY_PROTOCOL_FORMAT);

  if (!match) {
    throw new Error(
      `Cannot parse ${protocol} as ProxyProtocol because it does not match the format "proxy--[UUID]--[UUID]" or the open-ended "proxy--[UUID]". Try using ProxyProtocol() to generate the protocol.`
    );
  }
  const [_, callerId, listenerId] = match;

  if (!UUID_FORMAT.test(callerId)) {
    throw new Error(
      `Cannot parse ${protocol} as ProxyProtocol because the first id isn't a UUID. Try using ProxyProtocol() to generate the protocol.`
    );
  }

  if (!UUID_FORMAT.test(listenerId)) {
    throw new Error(
      `Cannot parse ${protocol} as ProxyProtocol because the second id isn't a UUID. Try using ProxyProtocol() to generate the protocol.`
    );
  }

  return { callerId, listenerId };
}

/**
 * Matchmaker Protocol
 **/

const MATCHMAKER_PROTOCOL_FORMAT = /^matchmaker--(.+)$/;

export function MatchmakerProtocol(callerId: string) {
  return `matchmaker--${callerId}`;
}

export function isMatchmakerProtocol(protocol: string | null) {
  return (
    typeof protocol === "string" && MATCHMAKER_PROTOCOL_FORMAT.test(protocol)
  );
}

export function parseMatchmakerProtocol(protocol: string | null) {
  if (typeof protocol !== "string") {
    throw new Error(
      `Cannot parse ${protocol} as MatchmakerProtocol because it is not a string. Try using MatchmakerProtocol() to generate the protocol.`
    );
  }
  const match = protocol.match(MATCHMAKER_PROTOCOL_FORMAT);

  if (!match) {
    throw new Error(
      `Cannot parse ${protocol} as MatchmakerProtocol because it does not match the format "matchmaker--[UUID]". Try using MatchmakerProtocol() to generate the protocol.`
    );
  }
  const [_, callerId] = match;

  if (!UUID_FORMAT.test(callerId)) {
    throw new Error(
      `Cannot parse ${protocol} as MatchmakerProtocol because id isn't a UUID. Try using MatchmakerProtocol() to generate the protocol.`
    );
  }

  return { callerId };
}
