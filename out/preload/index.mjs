import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electron", {
  /* Torrenting */
  startGameDownload: (payload) => ipcRenderer.invoke("startGameDownload", payload),
  cancelGameDownload: (gameId) => ipcRenderer.invoke("cancelGameDownload", gameId),
  pauseGameDownload: (gameId) => ipcRenderer.invoke("pauseGameDownload", gameId),
  resumeGameDownload: (gameId) => ipcRenderer.invoke("resumeGameDownload", gameId),
  onDownloadProgress: (cb) => {
    const listener = (_event, value) => cb(value);
    ipcRenderer.on("on-download-progress", listener);
    return () => ipcRenderer.removeListener("on-download-progress", listener);
  },
  /* Catalogue */
  searchGames: (query) => ipcRenderer.invoke("searchGames", query),
  getCatalogue: () => ipcRenderer.invoke("getCatalogue"),
  getGameShopDetails: (objectID, shop, language) => ipcRenderer.invoke("getGameShopDetails", objectID, shop, language),
  getRandomGame: () => ipcRenderer.invoke("getRandomGame"),
  getHowLongToBeat: (objectID, shop, title) => ipcRenderer.invoke("getHowLongToBeat", objectID, shop, title),
  getGames: (take, prevCursor) => ipcRenderer.invoke("getGames", take, prevCursor),
  searchGameRepacks: (query) => ipcRenderer.invoke("searchGameRepacks", query),
  /* User preferences */
  getUserPreferences: () => ipcRenderer.invoke("getUserPreferences"),
  updateUserPreferences: (preferences) => ipcRenderer.invoke("updateUserPreferences", preferences),
  autoLaunch: (enabled) => ipcRenderer.invoke("autoLaunch", enabled),
  authenticateRealDebrid: (apiToken) => ipcRenderer.invoke("authenticateRealDebrid", apiToken),
  /* Download sources */
  getDownloadSources: () => ipcRenderer.invoke("getDownloadSources"),
  validateDownloadSource: (url) => ipcRenderer.invoke("validateDownloadSource", url),
  addDownloadSource: (url) => ipcRenderer.invoke("addDownloadSource", url),
  removeDownloadSource: (id) => ipcRenderer.invoke("removeDownloadSource", id),
  syncDownloadSources: () => ipcRenderer.invoke("syncDownloadSources"),
  /* Library */
  addGameToLibrary: (objectID, title, shop) => ipcRenderer.invoke("addGameToLibrary", objectID, title, shop),
  createGameShortcut: (id) => ipcRenderer.invoke("createGameShortcut", id),
  updateExecutablePath: (id, executablePath) => ipcRenderer.invoke("updateExecutablePath", id, executablePath),
  getLibrary: () => ipcRenderer.invoke("getLibrary"),
  openGameInstaller: (gameId) => ipcRenderer.invoke("openGameInstaller", gameId),
  openGameInstallerPath: (gameId) => ipcRenderer.invoke("openGameInstallerPath", gameId),
  openGameExecutablePath: (gameId) => ipcRenderer.invoke("openGameExecutablePath", gameId),
  openGame: (gameId, executablePath) => ipcRenderer.invoke("openGame", gameId, executablePath),
  closeGame: (gameId) => ipcRenderer.invoke("closeGame", gameId),
  removeGameFromLibrary: (gameId) => ipcRenderer.invoke("removeGameFromLibrary", gameId),
  removeGame: (gameId) => ipcRenderer.invoke("removeGame", gameId),
  deleteGameFolder: (gameId) => ipcRenderer.invoke("deleteGameFolder", gameId),
  getGameByObjectID: (objectID) => ipcRenderer.invoke("getGameByObjectID", objectID),
  onGamesRunning: (cb) => {
    const listener = (_event, gamesRunning) => cb(gamesRunning);
    ipcRenderer.on("on-games-running", listener);
    return () => ipcRenderer.removeListener("on-games-running", listener);
  },
  onLibraryBatchComplete: (cb) => {
    const listener = (_event) => cb();
    ipcRenderer.on("on-library-batch-complete", listener);
    return () => ipcRenderer.removeListener("on-library-batch-complete", listener);
  },
  /* Hardware */
  getDiskFreeSpace: (path) => ipcRenderer.invoke("getDiskFreeSpace", path),
  /* Misc */
  ping: () => ipcRenderer.invoke("ping"),
  getVersion: () => ipcRenderer.invoke("getVersion"),
  getDefaultDownloadsPath: () => ipcRenderer.invoke("getDefaultDownloadsPath"),
  isPortableVersion: () => ipcRenderer.invoke("isPortableVersion"),
  openExternal: (src) => ipcRenderer.invoke("openExternal", src),
  showOpenDialog: (options) => ipcRenderer.invoke("showOpenDialog", options),
  platform: process.platform,
  /* Auto update */
  onAutoUpdaterEvent: (cb) => {
    const listener = (_event, value) => cb(value);
    ipcRenderer.on("autoUpdaterEvent", listener);
    return () => {
      ipcRenderer.removeListener("autoUpdaterEvent", listener);
    };
  },
  checkForUpdates: () => ipcRenderer.invoke("checkForUpdates"),
  restartAndInstallUpdate: () => ipcRenderer.invoke("restartAndInstallUpdate"),
  /* Profile */
  getMe: () => ipcRenderer.invoke("getMe"),
  updateProfile: (displayName, newProfileImagePath) => ipcRenderer.invoke("updateProfile", displayName, newProfileImagePath),
  /* User */
  getUser: (userId) => ipcRenderer.invoke("getUser", userId),
  /* Auth */
  signOut: () => ipcRenderer.invoke("signOut"),
  openAuthWindow: () => ipcRenderer.invoke("openAuthWindow"),
  getSessionHash: () => ipcRenderer.invoke("getSessionHash"),
  onSignIn: (cb) => {
    const listener = (_event) => cb();
    ipcRenderer.on("on-signin", listener);
    return () => ipcRenderer.removeListener("on-signin", listener);
  },
  onSignOut: (cb) => {
    const listener = (_event) => cb();
    ipcRenderer.on("on-signout", listener);
    return () => ipcRenderer.removeListener("on-signout", listener);
  }
});
