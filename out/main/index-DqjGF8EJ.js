;!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="66df5983-c0fa-4cc6-9a89-3853c45e1209",e._sentryDebugIdIdentifier="sentry-dbid-66df5983-c0fa-4cc6-9a89-3853c45e1209")}catch(e){}}();import { l as logger, j as requestWebPage, k as requestSteam250, R as RepacksManager, m as getSteamAppAsset, n as gameShopCacheRepository, o as steamGamesWorker, p as getSteam250List, g as gameRepository, q as getFileBase64, P as PythonInstance, u as userPreferencesRepository, v as defaultDownloadsPath, H as HydraApi, W as WindowManager, b as dataSource, w as DownloadQueue, G as Game, r as repackRepository, h as downloadQueueRepository, d as downloadSourceRepository, a as downloadSourceWorker, D as DownloadSource, U as UserAuth, x as userAuthRepository } from './index.js';
import { ipcMain, app, shell, dialog } from 'electron';
import axios from 'axios';
import '@electron-toolkit/utils';
import i18n from 'i18next';
import path from 'node:path';
import { Not, IsNull } from 'typeorm';
import 'url';
import { orderBy, shuffle } from 'lodash-es';
import { f as formatName, r as removeSymbolsFromName, U as UserNotLoggedInError } from './index-0S7GjpUn.js';
import 'icojs';
import 'parse-torrent';
import { JSDOM } from 'jsdom';
import 'user-agents';
import checkDiskSpace from 'check-disk-space';
import { c as createGame, D as DownloadManager, p as publishNotificationUpdateReadyToInstall, R as RealDebridClient, i as insertDownloadsFromSource, f as fetchDownloadSourcesAndUpdate, g as gamesPlaytime } from './main-DXgGqmXm.js';
import createDesktopShortcut from 'create-desktop-shortcuts';
import sudo from 'sudo-prompt';
import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { spawnSync, exec } from 'node:child_process';
import { Document } from 'yaml';
import AutoLaunch from 'auto-launch';
import path$1 from 'path';
import updater from 'electron-updater';
import { d as downloadSourceSchema } from './validators-BGrj6pz9.js';
import * as Sentry from '@sentry/electron/main';
import jwt from 'jsonwebtoken';
import { fileTypeFromFile } from 'file-type';

const getSteamAppDetails = async (objectID, language)=>{
    const searchParams = new URLSearchParams({
        appids: objectID,
        l: language
    });
    return axios.get(`http://store.steampowered.com/api/appdetails?${searchParams.toString()}`).then((response)=>{
        if (response.data[objectID].success) return response.data[objectID].data;
        return null;
    }).catch((err)=>{
        logger.error(err, {
            method: "getSteamAppDetails"
        });
        return null;
    });
};

const searchHowLongToBeat = async (gameName)=>{
    const response = await axios.post("https://howlongtobeat.com/api/search", {
        searchType: "games",
        searchTerms: formatName(gameName).split(" "),
        searchPage: 1,
        size: 100
    }, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            Referer: "https://howlongtobeat.com/"
        }
    });
    return response.data;
};
const parseListItems = ($lis)=>{
    return $lis.map(($li)=>{
        const title = $li.querySelector("h4")?.textContent;
        const [, accuracyClassName] = Array.from($li.classList);
        const accuracy = accuracyClassName.split("time_").at(1);
        return {
            title: title ?? "",
            duration: $li.querySelector("h5")?.textContent ?? "",
            accuracy: accuracy ?? ""
        };
    });
};
const getHowLongToBeatGame = async (id)=>{
    const response = await requestWebPage(`https://howlongtobeat.com/game/${id}`);
    const { window } = new JSDOM(response);
    const { document } = window;
    const $ul = document.querySelector(".shadow_shadow ul");
    if (!$ul) return [];
    const $lis = Array.from($ul.children);
    const [$firstLi] = $lis;
    if ($firstLi.tagName === "DIV") {
        const $pcData = $lis.find(($li)=>$li.textContent?.includes("PC"));
        return parseListItems(Array.from($pcData?.querySelectorAll("li") ?? []));
    }
    return parseListItems($lis);
};

const registerEvent = (name, listener)=>{
    ipcMain.handle(name, async (event, ...args)=>{
        return Promise.resolve(listener(event, ...args)).then((result)=>{
            if (!result) return result;
            return JSON.parse(JSON.stringify(result));
        });
    });
};

const resultSize = 12;
const getCatalogue = async (_event)=>{
    const trendingGames = await requestSteam250("/90day");
    const results = [];
    for(let i = 0; i < resultSize; i++){
        if (!trendingGames[i]) {
            i++;
            continue;
        }
        const { title, objectID } = trendingGames[i];
        const repacks = RepacksManager.search({
            query: formatName(title)
        });
        const catalogueEntry = {
            objectID,
            title,
            shop: "steam",
            cover: getSteamAppAsset("library", objectID)
        };
        results.push({
            ...catalogueEntry,
            repacks
        });
    }
    return results;
};
registerEvent("getCatalogue", getCatalogue);

const getLocalizedSteamAppDetails = async (objectID, language)=>{
    if (language === "english") {
        return getSteamAppDetails(objectID, language);
    }
    return getSteamAppDetails(objectID, language).then(async (localizedAppDetails)=>{
        const steamGame = await steamGamesWorker.run(Number(objectID), {
            name: "getById"
        });
        if (steamGame && localizedAppDetails) {
            return {
                ...localizedAppDetails,
                name: steamGame.name
            };
        }
        return null;
    });
};
const getGameShopDetails = async (_event, objectID, shop, language)=>{
    if (shop === "steam") {
        const cachedData = await gameShopCacheRepository.findOne({
            where: {
                objectID,
                language
            }
        });
        const appDetails = getLocalizedSteamAppDetails(objectID, language).then((result)=>{
            gameShopCacheRepository.upsert({
                objectID,
                shop: "steam",
                language,
                serializedData: JSON.stringify(result)
            }, [
                "objectID"
            ]);
            return result;
        });
        const cachedGame = cachedData?.serializedData ? JSON.parse(cachedData?.serializedData) : null;
        if (cachedGame) {
            return {
                ...cachedGame,
                objectID
            };
        }
        return Promise.resolve(appDetails);
    }
    throw new Error("Not implemented");
};
registerEvent("getGameShopDetails", getGameShopDetails);

const convertSteamGameToCatalogueEntry = (game)=>({
        objectID: String(game.id),
        title: game.name,
        shop: "steam",
        cover: getSteamAppAsset("library", String(game.id)),
        repacks: []
    });
const searchSteamGames = async (options)=>{
    const steamGames = await steamGamesWorker.run(options, {
        name: "search"
    });
    const result = RepacksManager.findRepacksForCatalogueEntries(steamGames.map((game)=>convertSteamGameToCatalogueEntry(game)));
    return orderBy(result, [
        ({ repacks })=>repacks.length,
        "repacks"
    ], [
        "desc"
    ]);
};

const getGames = async (_event, take = 12, cursor = 0)=>{
    const steamGames = await steamGamesWorker.run({
        limit: take,
        offset: cursor
    }, {
        name: "list"
    });
    const entries = RepacksManager.findRepacksForCatalogueEntries(steamGames.map((game)=>convertSteamGameToCatalogueEntry(game)));
    return {
        results: entries,
        cursor: cursor + entries.length
    };
};
registerEvent("getGames", getGames);

const getHowLongToBeat = async (_event, objectID, shop, title)=>{
    const searchHowLongToBeatPromise = searchHowLongToBeat(title);
    const gameShopCache = await gameShopCacheRepository.findOne({
        where: {
            objectID,
            shop
        }
    });
    const howLongToBeatCachedData = gameShopCache?.howLongToBeatSerializedData ? JSON.parse(gameShopCache?.howLongToBeatSerializedData) : null;
    if (howLongToBeatCachedData) return howLongToBeatCachedData;
    return searchHowLongToBeatPromise.then(async (response)=>{
        const game = response.data.find((game)=>game.profile_steam === Number(objectID));
        if (!game) return null;
        const howLongToBeat = await getHowLongToBeatGame(String(game.game_id));
        gameShopCacheRepository.upsert({
            objectID,
            shop,
            howLongToBeatSerializedData: JSON.stringify(howLongToBeat)
        }, [
            "objectID"
        ]);
        return howLongToBeat;
    });
};
registerEvent("getHowLongToBeat", getHowLongToBeat);

const state = {
    games: Array(),
    index: 0
};
const filterGames = async (games)=>{
    const results = [];
    for (const game of games){
        const catalogue = await searchSteamGames({
            query: game.title
        });
        if (catalogue.length) {
            const [steamGame] = catalogue;
            if (steamGame.repacks.length) {
                results.push(game);
            }
        }
    }
    return results;
};
const getRandomGame = async (_event)=>{
    if (state.games.length == 0) {
        const steam250List = await getSteam250List();
        const filteredSteam250List = await filterGames(steam250List);
        state.games = shuffle(filteredSteam250List);
    }
    if (state.games.length == 0) {
        return "";
    }
    state.index += 1;
    if (state.index == state.games.length) {
        state.index = 0;
        state.games = shuffle(state.games);
    }
    return state.games[state.index];
};
registerEvent("getRandomGame", getRandomGame);

const searchGamesEvent = async (_event, query)=>searchSteamGames({
        query,
        limit: 12
    });
registerEvent("searchGames", searchGamesEvent);

const searchGameRepacks = (_event, query)=>RepacksManager.search({
        query
    });
registerEvent("searchGameRepacks", searchGameRepacks);

const getDiskFreeSpace = async (_event, path)=>checkDiskSpace(path);
registerEvent("getDiskFreeSpace", getDiskFreeSpace);

const addGameToLibrary = async (_event, objectID, title, shop)=>{
    return gameRepository.update({
        objectID
    }, {
        shop,
        status: null,
        isDeleted: false
    }).then(async ({ affected })=>{
        if (!affected) {
            const steamGame = await steamGamesWorker.run(Number(objectID), {
                name: "getById"
            });
            const iconUrl = steamGame?.clientIcon ? getSteamAppAsset("icon", objectID, steamGame.clientIcon) : null;
            await gameRepository.insert({
                title,
                iconUrl,
                objectID,
                shop
            }).then(()=>{
                if (iconUrl) {
                    getFileBase64(iconUrl).then((base64)=>gameRepository.update({
                            objectID
                        }, {
                            iconUrl: base64
                        }));
                }
            });
        }
        const game = await gameRepository.findOne({
            where: {
                objectID
            }
        });
        createGame(game);
    });
};
registerEvent("addGameToLibrary", addGameToLibrary);

const createGameShortcut = async (_event, id)=>{
    const game = await gameRepository.findOne({
        where: {
            id,
            executablePath: Not(IsNull())
        }
    });
    if (game) {
        const filePath = game.executablePath;
        const windowVbsPath = app.isPackaged ? path.join(process.resourcesPath, "windows.vbs") : undefined;
        const options = {
            filePath,
            name: removeSymbolsFromName(game.title)
        };
        return createDesktopShortcut({
            windows: {
                ...options,
                VBScriptPath: windowVbsPath
            },
            linux: options,
            osx: options
        });
    }
    return false;
};
registerEvent("createGameShortcut", createGameShortcut);

const getKillCommand = (pid)=>{
    if (process.platform == "win32") {
        return `taskkill /PID ${pid}`;
    }
    return `kill -9 ${pid}`;
};
const closeGame = async (_event, gameId)=>{
    const processes = await PythonInstance.getProcessList();
    const game = await gameRepository.findOne({
        where: {
            id: gameId,
            isDeleted: false
        }
    });
    if (!game) return;
    const gameProcess = processes.find((runningProcess)=>{
        return runningProcess.exe === game.executablePath;
    });
    if (gameProcess) {
        try {
            process.kill(gameProcess.pid);
        } catch (err) {
            sudo.exec(getKillCommand(gameProcess.pid), {
                name: app.getName()
            }, (error, _stdout, _stderr)=>{
                logger.error(error);
            });
        }
    }
};
registerEvent("closeGame", closeGame);

const getDownloadsPath = async ()=>{
    const userPreferences = await userPreferencesRepository.findOne({
        where: {
            id: 1
        }
    });
    if (userPreferences && userPreferences.downloadsPath) return userPreferences.downloadsPath;
    return defaultDownloadsPath;
};

const deleteGameFolder = async (_event, gameId)=>{
    const game = await gameRepository.findOne({
        where: [
            {
                id: gameId,
                isDeleted: false,
                status: "removed"
            },
            {
                id: gameId,
                progress: 1,
                isDeleted: false
            }
        ]
    });
    if (!game) return;
    if (game.folderName) {
        const folderPath = path.join(game.downloadPath ?? await getDownloadsPath(), game.folderName);
        if (fs.existsSync(folderPath)) {
            await new Promise((resolve, reject)=>{
                fs.rm(folderPath, {
                    recursive: true,
                    force: true,
                    maxRetries: 5,
                    retryDelay: 200
                }, (error)=>{
                    if (error) {
                        logger.error(error);
                        reject();
                    }
                    resolve();
                });
            });
        }
    }
    await gameRepository.update({
        id: gameId
    }, {
        downloadPath: null,
        folderName: null,
        status: null,
        progress: 0
    });
};
registerEvent("deleteGameFolder", deleteGameFolder);

const getGameByObjectID = async (_event, objectID)=>gameRepository.findOne({
        where: {
            objectID,
            isDeleted: false
        }
    });
registerEvent("getGameByObjectID", getGameByObjectID);

const getLibrary = async ()=>gameRepository.find({
        where: {
            isDeleted: false
        },
        relations: {
            downloadQueue: true
        },
        order: {
            createdAt: "desc"
        }
    });
registerEvent("getLibrary", getLibrary);

const parseExecutablePath = (path)=>{
    if (process.platform === "win32" && path.endsWith(".lnk")) {
        const { target } = shell.readShortcutLink(path);
        return target;
    }
    return path;
};

const openGame = async (_event, gameId, executablePath)=>{
    const parsedPath = parseExecutablePath(executablePath);
    await gameRepository.update({
        id: gameId
    }, {
        executablePath: parsedPath
    });
    shell.openPath(parsedPath);
};
registerEvent("openGame", openGame);

const openGameExecutablePath = async (_event, gameId)=>{
    const game = await gameRepository.findOne({
        where: {
            id: gameId,
            isDeleted: false
        }
    });
    if (!game || !game.executablePath) return;
    shell.showItemInFolder(game.executablePath);
};
registerEvent("openGameExecutablePath", openGameExecutablePath);

const generateYML = (game)=>{
    const slugifiedGameTitle = game.title.replace(/\s/g, "-").toLocaleLowerCase();
    const doc = new Document({
        name: game.title,
        game_slug: slugifiedGameTitle,
        slug: `${slugifiedGameTitle}-installer`,
        version: "Installer",
        runner: "wine",
        script: {
            game: {
                prefix: "$GAMEDIR",
                arch: "win64",
                working_dir: "$GAMEDIR"
            },
            installer: [
                {
                    task: {
                        name: "create_prefix",
                        arch: "win64",
                        prefix: "$GAMEDIR"
                    }
                },
                {
                    task: {
                        executable: path.join(game.downloadPath, game.folderName, "setup.exe"),
                        name: "wineexec",
                        prefix: "$GAMEDIR"
                    }
                }
            ]
        }
    });
    return doc.toString();
};

const executeGameInstaller = (filePath)=>{
    if (process.platform === "win32") {
        shell.openPath(filePath);
        return true;
    }
    if (spawnSync("which", [
        "wine"
    ]).status === 0) {
        exec(`wine "${filePath}"`);
        return true;
    }
    return false;
};
const openGameInstaller = async (_event, gameId)=>{
    const game = await gameRepository.findOne({
        where: {
            id: gameId,
            isDeleted: false
        }
    });
    if (!game || !game.folderName) return true;
    const gamePath = path.join(game.downloadPath ?? await getDownloadsPath(), game.folderName);
    if (!fs.existsSync(gamePath)) {
        await gameRepository.update({
            id: gameId
        }, {
            status: null
        });
        return true;
    }
    if (process.platform === "darwin") {
        shell.openPath(gamePath);
        return true;
    }
    if (fs.lstatSync(gamePath).isFile()) {
        return executeGameInstaller(gamePath);
    }
    const setupPath = path.join(gamePath, "setup.exe");
    if (fs.existsSync(setupPath)) {
        return executeGameInstaller(setupPath);
    }
    const gamePathFileNames = fs.readdirSync(gamePath);
    const gamePathExecutableFiles = gamePathFileNames.filter((fileName)=>path.extname(fileName).toLowerCase() === ".exe");
    if (gamePathExecutableFiles.length === 1) {
        return executeGameInstaller(path.join(gamePath, gamePathExecutableFiles[0]));
    }
    if (spawnSync("which", [
        "lutris"
    ]).status === 0) {
        const ymlPath = path.join(gamePath, "setup.yml");
        await writeFile(ymlPath, generateYML(game));
        exec(`lutris --install "${ymlPath}"`);
        return true;
    }
    shell.openPath(gamePath);
    return true;
};
registerEvent("openGameInstaller", openGameInstaller);

const openGameInstallerPath = async (_event, gameId)=>{
    const game = await gameRepository.findOne({
        where: {
            id: gameId,
            isDeleted: false
        }
    });
    if (!game || !game.folderName || !game.downloadPath) return true;
    const gamePath = path.join(game.downloadPath ?? await getDownloadsPath(), game.folderName);
    shell.showItemInFolder(gamePath);
    return true;
};
registerEvent("openGameInstallerPath", openGameInstallerPath);

const updateExecutablePath = async (_event, id, executablePath)=>{
    return gameRepository.update({
        id
    }, {
        executablePath: parseExecutablePath(executablePath)
    });
};
registerEvent("updateExecutablePath", updateExecutablePath);

const removeGame = async (_event, gameId)=>{
    await gameRepository.update({
        id: gameId
    }, {
        status: "removed",
        downloadPath: null,
        bytesDownloaded: 0,
        progress: 0
    });
};
registerEvent("removeGame", removeGame);

const removeGameFromLibrary = async (_event, gameId)=>{
    gameRepository.update({
        id: gameId
    }, {
        isDeleted: true,
        executablePath: null
    });
    removeRemoveGameFromLibrary(gameId).catch((err)=>{
        logger.error("removeRemoveGameFromLibrary", err);
    });
};
const removeRemoveGameFromLibrary = async (gameId)=>{
    const game = await gameRepository.findOne({
        where: {
            id: gameId
        }
    });
    if (game?.remoteId) {
        HydraApi.delete(`/games/${game.remoteId}`).catch(()=>{});
    }
};
registerEvent("removeGameFromLibrary", removeGameFromLibrary);

const openExternal = async (_event, src)=>shell.openExternal(src);
registerEvent("openExternal", openExternal);

const showOpenDialog = async (_event, options)=>{
    if (WindowManager.mainWindow) {
        return dialog.showOpenDialog(WindowManager.mainWindow, options);
    }
    throw new Error("Main window is not available");
};
registerEvent("showOpenDialog", showOpenDialog);

const cancelGameDownload = async (_event, gameId)=>{
    await dataSource.transaction(async (transactionalEntityManager)=>{
        await DownloadManager.cancelDownload(gameId);
        await transactionalEntityManager.getRepository(DownloadQueue).delete({
            game: {
                id: gameId
            }
        });
        await transactionalEntityManager.getRepository(Game).update({
            id: gameId
        }, {
            status: "removed",
            bytesDownloaded: 0,
            progress: 0
        });
    });
};
registerEvent("cancelGameDownload", cancelGameDownload);

const pauseGameDownload = async (_event, gameId)=>{
    await dataSource.transaction(async (transactionalEntityManager)=>{
        await DownloadManager.pauseDownload();
        await transactionalEntityManager.getRepository(DownloadQueue).delete({
            game: {
                id: gameId
            }
        });
        await transactionalEntityManager.getRepository(Game).update({
            id: gameId
        }, {
            status: "paused"
        });
    });
};
registerEvent("pauseGameDownload", pauseGameDownload);

const resumeGameDownload = async (_event, gameId)=>{
    const game = await gameRepository.findOne({
        where: {
            id: gameId,
            isDeleted: false
        }
    });
    if (!game) return;
    if (game.status === "paused") {
        await dataSource.transaction(async (transactionalEntityManager)=>{
            await DownloadManager.pauseDownload();
            await transactionalEntityManager.getRepository(Game).update({
                status: "active",
                progress: Not(1)
            }, {
                status: "paused"
            });
            await DownloadManager.resumeDownload(game);
            await transactionalEntityManager.getRepository(DownloadQueue).delete({
                game: {
                    id: gameId
                }
            });
            await transactionalEntityManager.getRepository(DownloadQueue).insert({
                game: {
                    id: gameId
                }
            });
            await transactionalEntityManager.getRepository(Game).update({
                id: gameId
            }, {
                status: "active"
            });
        });
    }
};
registerEvent("resumeGameDownload", resumeGameDownload);

const startGameDownload = async (_event, payload)=>{
    const { repackId, objectID, title, shop, downloadPath, downloader } = payload;
    const [game, repack] = await Promise.all([
        gameRepository.findOne({
            where: {
                objectID,
                shop
            }
        }),
        repackRepository.findOne({
            where: {
                id: repackId
            }
        })
    ]);
    if (!repack) return;
    await DownloadManager.pauseDownload();
    await gameRepository.update({
        status: "active",
        progress: Not(1)
    }, {
        status: "paused"
    });
    if (game) {
        await gameRepository.update({
            id: game.id
        }, {
            status: "active",
            progress: 0,
            bytesDownloaded: 0,
            downloadPath,
            downloader,
            uri: repack.magnet,
            isDeleted: false
        });
    } else {
        const steamGame = await steamGamesWorker.run(Number(objectID), {
            name: "getById"
        });
        const iconUrl = steamGame?.clientIcon ? getSteamAppAsset("icon", objectID, steamGame.clientIcon) : null;
        await gameRepository.insert({
            title,
            iconUrl,
            objectID,
            downloader,
            shop,
            status: "active",
            downloadPath,
            uri: repack.magnet
        }).then((result)=>{
            if (iconUrl) {
                getFileBase64(iconUrl).then((base64)=>gameRepository.update({
                        objectID
                    }, {
                        iconUrl: base64
                    }));
            }
            return result;
        });
    }
    const updatedGame = await gameRepository.findOne({
        where: {
            objectID
        }
    });
    createGame(updatedGame);
    await downloadQueueRepository.delete({
        game: {
            id: updatedGame.id
        }
    });
    await downloadQueueRepository.insert({
        game: {
            id: updatedGame.id
        }
    });
    await DownloadManager.startDownload(updatedGame);
};
registerEvent("startGameDownload", startGameDownload);

const getUserPreferences = async ()=>userPreferencesRepository.findOne({
        where: {
            id: 1
        }
    });
registerEvent("getUserPreferences", getUserPreferences);

const updateUserPreferences = async (_event, preferences)=>{
    if (preferences.language) {
        i18n.changeLanguage(preferences.language);
    }
    return userPreferencesRepository.upsert({
        id: 1,
        ...preferences
    }, [
        "id"
    ]);
};
registerEvent("updateUserPreferences", updateUserPreferences);

const windowsStartupPath = path$1.join(app.getPath("appData"), "Microsoft", "Windows", "Start Menu", "Programs", "Startup");
const autoLaunch = async (_event, enabled)=>{
    if (!app.isPackaged) return;
    const appLauncher = new AutoLaunch({
        name: app.getName()
    });
    if (enabled) {
        appLauncher.enable().catch((err)=>{
            logger.error(err);
        });
    } else {
        if (process.platform == "win32") {
            fs.rm(path$1.join(windowsStartupPath, "Hydra.vbs"), ()=>{});
        }
        appLauncher.disable().catch((err)=>{
            logger.error(err);
        });
    }
};
registerEvent("autoLaunch", autoLaunch);

const { autoUpdater: autoUpdater$1 } = updater;
const sendEvent = (event) => {
  WindowManager.mainWindow?.webContents.send("autoUpdaterEvent", event);
};
const isAutoInstallAvailable = process.platform !== "darwin" && process.env.PORTABLE_EXECUTABLE_FILE == null;
const newVersionInfo = {
  version: ""
};
const checkForUpdates = async (_event) => {
  autoUpdater$1.once("update-available", (info) => {
    sendEvent({
      type: "update-available",
      info
    });
    newVersionInfo.version = info.version;
  }).once("update-downloaded", () => {
    sendEvent({
      type: "update-downloaded"
    });
    publishNotificationUpdateReadyToInstall(newVersionInfo.version);
  });
  if (app.isPackaged) {
    autoUpdater$1.autoDownload = isAutoInstallAvailable;
    autoUpdater$1.checkForUpdates();
  }
  return isAutoInstallAvailable;
};
registerEvent("checkForUpdates", checkForUpdates);

const { autoUpdater } = updater;
const restartAndInstallUpdate = async (_event)=>{
    autoUpdater.removeAllListeners();
    if (app.isPackaged) {
        autoUpdater.quitAndInstall(true, true);
    }
};
registerEvent("restartAndInstallUpdate", restartAndInstallUpdate);

const authenticateRealDebrid = async (_event, apiToken)=>{
    RealDebridClient.authorize(apiToken);
    const user = await RealDebridClient.getUser();
    return user;
};
registerEvent("authenticateRealDebrid", authenticateRealDebrid);

const getDownloadSources = async (_event)=>{
    return downloadSourceRepository.createQueryBuilder("downloadSource").leftJoin("downloadSource.repacks", "repacks").orderBy("downloadSource.createdAt", "DESC").loadRelationCountAndMap("downloadSource.repackCount", "downloadSource.repacks").getMany();
};
registerEvent("getDownloadSources", getDownloadSources);

const validateDownloadSource = async (_event, url)=>{
    const existingSource = await downloadSourceRepository.findOne({
        where: {
            url
        }
    });
    if (existingSource) throw new Error("Source with the same url already exists");
    const repacks = RepacksManager.repacks;
    return downloadSourceWorker.run({
        url,
        repacks
    }, {
        name: "validateDownloadSource"
    });
};
registerEvent("validateDownloadSource", validateDownloadSource);

const addDownloadSource = async (_event, url)=>{
    const response = await axios.get(url);
    const source = downloadSourceSchema.parse(response.data);
    const downloadSource = await dataSource.transaction(async (transactionalEntityManager)=>{
        const downloadSource = await transactionalEntityManager.getRepository(DownloadSource).save({
            url,
            name: source.name,
            downloadCount: source.downloads.length
        });
        await insertDownloadsFromSource(transactionalEntityManager, downloadSource, source.downloads);
        return downloadSource;
    });
    await RepacksManager.updateRepacks();
    return downloadSource;
};
registerEvent("addDownloadSource", addDownloadSource);

const removeDownloadSource = async (_event, id)=>{
    await downloadSourceRepository.delete(id);
    await RepacksManager.updateRepacks();
};
registerEvent("removeDownloadSource", removeDownloadSource);

const syncDownloadSources = async (_event)=>fetchDownloadSourcesAndUpdate();
registerEvent("syncDownloadSources", syncDownloadSources);

const signOut = async (_event)=>{
    const databaseOperations = dataSource.transaction(async (transactionalEntityManager)=>{
        await transactionalEntityManager.getRepository(DownloadQueue).delete({});
        await transactionalEntityManager.getRepository(Game).delete({});
        await transactionalEntityManager.getRepository(UserAuth).delete({
            id: 1
        });
    }).then(()=>{
        gamesPlaytime.clear();
    });
    Sentry.setUser(null);
    PythonInstance.killTorrent();
    await Promise.all([
        databaseOperations,
        HydraApi.post("/auth/logout").catch(()=>{})
    ]);
};
registerEvent("signOut", signOut);

const openAuthWindow = async (_event)=>WindowManager.openAuthWindow();
registerEvent("openAuthWindow", openAuthWindow);

const getSessionHash = async (_event)=>{
    const auth = await userAuthRepository.findOne({
        where: {
            id: 1
        }
    });
    if (!auth) return null;
    const payload = jwt.decode(auth.accessToken);
    Sentry.setContext("sessionId", payload.sessionId);
    return payload.sessionId;
};
registerEvent("getSessionHash", getSessionHash);

const getUser = async (_event, userId)=>{
    try {
        const response = await HydraApi.get(`/user/${userId}`);
        const profile = response.data;
        const recentGames = await Promise.all(profile.recentGames.map(async (game)=>{
            const steamGame = await steamGamesWorker.run(Number(game.objectId), {
                name: "getById"
            });
            const iconUrl = steamGame?.clientIcon ? getSteamAppAsset("icon", game.objectId, steamGame.clientIcon) : null;
            return {
                ...game,
                ...convertSteamGameToCatalogueEntry(steamGame),
                iconUrl
            };
        }));
        const libraryGames = await Promise.all(profile.libraryGames.map(async (game)=>{
            const steamGame = await steamGamesWorker.run(Number(game.objectId), {
                name: "getById"
            });
            const iconUrl = steamGame?.clientIcon ? getSteamAppAsset("icon", game.objectId, steamGame.clientIcon) : null;
            return {
                ...game,
                ...convertSteamGameToCatalogueEntry(steamGame),
                iconUrl
            };
        }));
        return {
            ...profile,
            libraryGames,
            recentGames
        };
    } catch (err) {
        return null;
    }
};
registerEvent("getUser", getUser);

const getMe = async (_event)=>{
    return HydraApi.get(`/profile/me`).then((response)=>{
        const me = response.data;
        userAuthRepository.upsert({
            id: 1,
            displayName: me.displayName,
            profileImageUrl: me.profileImageUrl,
            userId: me.id
        }, [
            "id"
        ]);
        Sentry.setUser({
            id: me.id,
            username: me.username
        });
        return me;
    }).catch((err)=>{
        if (err instanceof UserNotLoggedInError) {
            return null;
        }
        return userAuthRepository.findOne({
            where: {
                id: 1
            }
        });
    });
};
registerEvent("getMe", getMe);

const patchUserProfile = async (displayName, profileImageUrl)=>{
    if (profileImageUrl) {
        return HydraApi.patch("/profile", {
            displayName,
            profileImageUrl
        });
    } else {
        return HydraApi.patch("/profile", {
            displayName
        });
    }
};
const updateProfile = async (_event, displayName, newProfileImagePath)=>{
    if (!newProfileImagePath) {
        return patchUserProfile(displayName).then((response)=>response.data);
    }
    const stats = fs.statSync(newProfileImagePath);
    const fileBuffer = fs.readFileSync(newProfileImagePath);
    const fileSizeInBytes = stats.size;
    const profileImageUrl = await HydraApi.post(`/presigned-urls/profile-image`, {
        imageExt: path.extname(newProfileImagePath).slice(1),
        imageLength: fileSizeInBytes
    }).then(async (preSignedResponse)=>{
        const { presignedUrl, profileImageUrl } = preSignedResponse.data;
        const mimeType = await fileTypeFromFile(newProfileImagePath);
        await axios.put(presignedUrl, fileBuffer, {
            headers: {
                "Content-Type": mimeType?.mime
            }
        });
        return profileImageUrl;
    }).catch(()=>undefined);
    return patchUserProfile(displayName, profileImageUrl).then((response)=>response.data);
};
registerEvent("updateProfile", updateProfile);

ipcMain.handle("ping", () => "pong");
ipcMain.handle("getVersion", () => app.getVersion());
ipcMain.handle("isPortableVersion", () => process.env.PORTABLE_EXECUTABLE_FILE != null);
ipcMain.handle("getDefaultDownloadsPath", () => defaultDownloadsPath);
//# sourceMappingURL=index-DqjGF8EJ.js.map
