// L'app nativa usa il codice condiviso con la web app (../orienta): schede delle condizioni,
// vocabolari, segnali d'allarme, riconoscimento dei sintomi, motore a regole e schemi Zod.
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const webApp = path.resolve(projectRoot, "../orienta");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// I file condivisi stanno fuori dalla cartella dell'app: Metro li deve vedere e seguire
config.watchFolders = [...(config.watchFolders ?? []), path.join(webApp, "src"), path.join(webApp, "data")];

const appRootFile = path.join(projectRoot, "package.json");
const isPackage = (name) => !/^(\.|\/|@\/|@data\/|~\/)/.test(name);

// I moduli "server-only" della web app non vanno mai importati qui: babel-preset-expo li rifiuta
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // I pacchetti richiesti dal codice condiviso (per esempio zod) vengono dai node_modules
  // dell'app, mai da quelli della web app: una sola copia di ogni pacchetto
  if (context.originModulePath.startsWith(webApp + path.sep) && isPackage(moduleName)) {
    return context.resolveRequest({ ...context, originModulePath: appRootFile }, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
