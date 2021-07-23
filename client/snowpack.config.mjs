import proxy from "http2-proxy";

/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  workspaceRoot: "..",
  alias: {},
  mount: {
    /* ... */
  },
  plugins: [
    /* ... */
  ],
  routes: [
    // SPA Fallback in development:
    {
      match: "routes",
      src: "/",
      dest: "/index.html",
    },
    // Websockets:
    {
      src: "/",
      upgrade: (req, socket, head) => {
        const defaultWSHandler = (err, _, socket, __) => {
          if (err) {
            console.error("proxy error", err);
            socket.destroy();
          }
        };

        proxy.ws(
          req,
          socket,
          head,
          {
            hostname: "localhost",
            port: 8000,
          },
          defaultWSHandler
        );
      },
    },
    {
      src: "/identity",
      dest: (req, res) => {
        return proxy.web(req, res, {
          hostname: "localhost",
          port: 8000,
        });
      },
    },
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
