export function ProxyProtocol(registerAsId: string, subscribeToId: string) {
  return `proxy--${registerAsId}--${subscribeToId}`;
}

const UUID_FORMAT = /^[0-9a-f]+-[0-9a-f]+-[0-9a-f]+-[0-9a-f]+-[0-9a-f]+$/;

export function parseProxyProtocol(protocol: string | null) {
  if (typeof protocol !== "string") {
    throw new Error(
      `Cannot parse ${protocol} as ProxyProtocol because it is not a string. Try using ProxyProtocol() to generate the protocol.`
    );
  }
  const match = protocol.match(/^proxy--(.+)--(.+)$/);

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
