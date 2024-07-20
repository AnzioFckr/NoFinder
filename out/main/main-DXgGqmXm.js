;!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="9f5a1beb-ebb3-487f-9669-dfb97ad42fc7",e._sentryDebugIdIdentifier="sentry-dbid-9f5a1beb-ebb3-487f-9669-dfb97ad42fc7")}catch(e){}}();import { d as downloadSourceRepository, a as downloadSourceWorker, b as dataSource, D as DownloadSource, R as RepacksManager, c as Repack, H as HydraApi, g as gameRepository, u as userPreferencesRepository, t as trayIcon, e as HttpDownload, f as calculateETA, P as PythonInstance, W as WindowManager, h as downloadQueueRepository, s as sleep, i as uploadGamesBatch, r as repackRepository } from './index.js';
import axios from 'axios';
import { Notification, nativeImage } from 'electron';
import '@electron-toolkit/utils';
import { t } from 'i18next';
import 'node:path';
import { Not, IsNull, MoreThan } from 'typeorm';
import { a as Downloader } from './index-0S7GjpUn.js';
import { parseICO } from 'icojs';
import parseTorrent from 'parse-torrent';
import 'jsdom';
import 'user-agents';
import 'url';
import { chunk } from 'lodash-es';

const insertDownloadsFromSource = async (trx, downloadSource, downloads)=>{
    const repacks = downloads.map((download)=>({
            title: download.title,
            magnet: download.uris[0],
            fileSize: download.fileSize,
            repacker: downloadSource.theguythatrepacked,
            uploadDate: download.uploadDate,
            downloadSource: {
                id: downloadSource.id
            }
        }));
    const downloadsChunks = chunk(repacks, 800);
    for (const chunk of downloadsChunks){
        await trx.getRepository(Repack).createQueryBuilder().insert().values(chunk).updateEntity(false).orIgnore().execute();
    }
};
const fetchDownloadSourcesAndUpdate = async ()=>{
    const downloadSources = await downloadSourceRepository.find({
        order: {
            id: "desc"
        }
    });
    const results = await downloadSourceWorker.run(downloadSources, {
        name: "getUpdatedRepacks"
    });
    await dataSource.transaction(async (transactionalEntityManager)=>{
        for (const result of results){
            if (result.etag !== null) {
                await transactionalEntityManager.getRepository(DownloadSource).update({
                    id: result.id
                }, {
                    etag: result.etag,
                    status: result.status,
                    downloadCount: result.downloads.length
                });
                await insertDownloadsFromSource(transactionalEntityManager, result, result.downloads);
            }
        }
        await RepacksManager.updateRepacks();
    });
};

const updateGamePlaytime = async (game, deltaInMillis, lastTimePlayed)=>{
    HydraApi.put(`/games/${game.remoteId}`, {
        playTimeDeltaInSeconds: Math.trunc(deltaInMillis / 1000),
        lastTimePlayed
    }).catch(()=>{});
};

const createGame = async (game)=>{
    HydraApi.post(`/games`, {
        objectId: game.objectID,
        playTimeInMilliseconds: Math.trunc(game.playTimeInMilliseconds),
        shop: game.shop,
        lastTimePlayed: game.lastTimePlayed
    }).then((response)=>{
        const { id: remoteId, playTimeInMilliseconds, lastTimePlayed } = response.data;
        gameRepository.update({
            objectID: game.objectID
        }, {
            remoteId,
            playTimeInMilliseconds,
            lastTimePlayed
        });
    }).catch(()=>{});
};

const getGameIconNativeImage = async (gameId)=>{
    try {
        const game = await gameRepository.findOne({
            where: {
                id: gameId
            }
        });
        if (!game?.iconUrl) return undefined;
        const images = await parseICO(Buffer.from(game.iconUrl.split("base64,")[1], "base64"));
        const highResIcon = images.find((image)=>image.width >= 128);
        if (!highResIcon) return undefined;
        return nativeImage.createFromBuffer(Buffer.from(highResIcon.buffer));
    } catch (err) {
        return undefined;
    }
};
const publishDownloadCompleteNotification = async (game)=>{
    const userPreferences = await userPreferencesRepository.findOne({
        where: {
            id: 1
        }
    });
    const icon = await getGameIconNativeImage(game.id);
    if (userPreferences?.downloadNotificationsEnabled) {
        new Notification({
            title: t("download_complete", {
                ns: "notifications"
            }),
            body: t("game_ready_to_install", {
                ns: "notifications",
                title: game.title
            }),
            icon
        }).show();
    }
};
const publishNewRepacksNotifications = async (count)=>{
    const userPreferences = await userPreferencesRepository.findOne({
        where: {
            id: 1
        }
    });
    if (userPreferences?.repackUpdatesNotificationsEnabled) {
        new Notification({
            title: t("repack_list_updated", {
                ns: "notifications"
            }),
            body: t("repack_count", {
                ns: "notifications",
                count: count
            })
        }).show();
    }
};
const publishNotificationUpdateReadyToInstall = async (version)=>{
    new Notification({
        title: t("new_update_available", {
            ns: "notifications",
            version
        }),
        body: t("restart_to_install_update", {
            ns: "notifications"
        }),
        icon: trayIcon
    }).show();
};

class RealDebridClient {
    static instance;
    static baseURL = "https://api.real-debrid.com/rest/1.0";
    static authorize(apiToken) {
        this.instance = axios.create({
            baseURL: this.baseURL,
            headers: {
                Authorization: `Bearer ${apiToken}`
            }
        });
    }
    static async addMagnet(magnet) {
        const searchParams = new URLSearchParams({
            magnet
        });
        const response = await this.instance.post("/torrents/addMagnet", searchParams.toString());
        return response.data;
    }
    static async getTorrentInfo(id) {
        const response = await this.instance.get(`/torrents/info/${id}`);
        return response.data;
    }
    static async getUser() {
        const response = await this.instance.get(`/user`);
        return response.data;
    }
    static async selectAllFiles(id) {
        const searchParams = new URLSearchParams({
            files: "all"
        });
        await this.instance.post(`/torrents/selectFiles/${id}`, searchParams.toString());
    }
    static async unrestrictLink(link) {
        const searchParams = new URLSearchParams({
            link
        });
        const response = await this.instance.post("/unrestrict/link", searchParams.toString());
        return response.data;
    }
    static async getAllTorrentsFromUser() {
        const response = await this.instance.get("/torrents");
        return response.data;
    }
    static async getTorrentId(magnetUri) {
        const userTorrents = await RealDebridClient.getAllTorrentsFromUser();
        const { infoHash } = await parseTorrent(magnetUri);
        const userTorrent = userTorrents.find((userTorrent)=>userTorrent.hash === infoHash);
        if (userTorrent) return userTorrent.id;
        const torrent = await RealDebridClient.addMagnet(magnetUri);
        return torrent.id;
    }
}

class RealDebridDownloader {
    static downloads = new Map();
    static downloadingGame = null;
    static realDebridTorrentId = null;
    static async getRealDebridDownloadUrl() {
        if (this.realDebridTorrentId) {
            const torrentInfo = await RealDebridClient.getTorrentInfo(this.realDebridTorrentId);
            const { status, links } = torrentInfo;
            if (status === "waiting_files_selection") {
                await RealDebridClient.selectAllFiles(this.realDebridTorrentId);
                return null;
            }
            if (status === "downloaded") {
                const [link] = links;
                const { download } = await RealDebridClient.unrestrictLink(link);
                return decodeURIComponent(download);
            }
        }
        return null;
    }
    static async getStatus() {
        if (this.downloadingGame) {
            const gid = this.downloads.get(this.downloadingGame.id);
            const status = await HttpDownload.getStatus(gid);
            if (status) {
                const progress = Number(status.completedLength) / Number(status.totalLength);
                await gameRepository.update({
                    id: this.downloadingGame.id
                }, {
                    bytesDownloaded: Number(status.completedLength),
                    fileSize: Number(status.totalLength),
                    progress,
                    status: "active"
                });
                const result = {
                    numPeers: 0,
                    numSeeds: 0,
                    downloadSpeed: Number(status.downloadSpeed),
                    timeRemaining: calculateETA(Number(status.totalLength), Number(status.completedLength), Number(status.downloadSpeed)),
                    isDownloadingMetadata: false,
                    isCheckingFiles: false,
                    progress,
                    gameId: this.downloadingGame.id
                };
                if (progress === 1) {
                    this.downloads.delete(this.downloadingGame.id);
                    this.realDebridTorrentId = null;
                    this.downloadingGame = null;
                }
                return result;
            }
        }
        if (this.realDebridTorrentId && this.downloadingGame) {
            const torrentInfo = await RealDebridClient.getTorrentInfo(this.realDebridTorrentId);
            const { status } = torrentInfo;
            if (status === "downloaded") {
                this.startDownload(this.downloadingGame);
            }
            const progress = torrentInfo.progress / 100;
            const totalDownloaded = progress * torrentInfo.bytes;
            return {
                numPeers: 0,
                numSeeds: torrentInfo.seeders,
                downloadSpeed: torrentInfo.speed,
                timeRemaining: calculateETA(torrentInfo.bytes, totalDownloaded, torrentInfo.speed),
                isDownloadingMetadata: status === "magnet_conversion"
            };
        }
        return null;
    }
    static async pauseDownload() {
        const gid = this.downloads.get(this.downloadingGame.id);
        if (gid) {
            await HttpDownload.pauseDownload(gid);
        }
        this.realDebridTorrentId = null;
        this.downloadingGame = null;
    }
    static async startDownload(game) {
        this.downloadingGame = game;
        if (this.downloads.has(game.id)) {
            await this.resumeDownload(game.id);
            return;
        }
        this.realDebridTorrentId = await RealDebridClient.getTorrentId(game.uri);
        const downloadUrl = await this.getRealDebridDownloadUrl();
        if (downloadUrl) {
            this.realDebridTorrentId = null;
            const gid = await HttpDownload.startDownload(game.downloadPath, downloadUrl);
            this.downloads.set(game.id, gid);
        }
    }
    static async cancelDownload(gameId) {
        const gid = this.downloads.get(gameId);
        if (gid) {
            await HttpDownload.cancelDownload(gid);
            this.downloads.delete(gameId);
        }
    }
    static async resumeDownload(gameId) {
        const gid = this.downloads.get(gameId);
        if (gid) {
            await HttpDownload.resumeDownload(gid);
        }
    }
}

class DownloadManager {
    static currentDownloader = null;
    static async watchDownloads() {
        let status = null;
        if (this.currentDownloader === Downloader.RealDebrid) {
            status = await RealDebridDownloader.getStatus();
        } else {
            status = await PythonInstance.getStatus();
        }
        if (status) {
            const { gameId, progress } = status;
            const game = await gameRepository.findOne({
                where: {
                    id: gameId,
                    isDeleted: false
                }
            });
            if (WindowManager.mainWindow && game) {
                WindowManager.mainWindow.setProgressBar(progress === 1 ? -1 : progress);
                WindowManager.mainWindow.webContents.send("on-download-progress", JSON.parse(JSON.stringify({
                    ...status,
                    game
                })));
            }
            if (progress === 1 && game) {
                publishDownloadCompleteNotification(game);
                await downloadQueueRepository.delete({
                    game
                });
                const [nextQueueItem] = await downloadQueueRepository.find({
                    order: {
                        id: "DESC"
                    },
                    relations: {
                        game: true
                    }
                });
                if (nextQueueItem) {
                    this.resumeDownload(nextQueueItem.game);
                }
            }
        }
    }
    static async pauseDownload() {
        if (this.currentDownloader === Downloader.RealDebrid) {
            await RealDebridDownloader.pauseDownload();
        } else {
            await PythonInstance.pauseDownload();
        }
        WindowManager.mainWindow?.setProgressBar(-1);
        this.currentDownloader = null;
    }
    static async resumeDownload(game) {
        if (game.downloader === Downloader.RealDebrid) {
            RealDebridDownloader.startDownload(game);
            this.currentDownloader = Downloader.RealDebrid;
        } else {
            PythonInstance.startDownload(game);
            this.currentDownloader = Downloader.Torrent;
        }
    }
    static async cancelDownload(gameId) {
        if (this.currentDownloader === Downloader.RealDebrid) {
            RealDebridDownloader.cancelDownload(gameId);
        } else {
            PythonInstance.cancelDownload(gameId);
        }
        WindowManager.mainWindow?.setProgressBar(-1);
        this.currentDownloader = null;
    }
    static async startDownload(game) {
        if (game.downloader === Downloader.RealDebrid) {
            RealDebridDownloader.startDownload(game);
            this.currentDownloader = Downloader.RealDebrid;
        } else {
            PythonInstance.startDownload(game);
            this.currentDownloader = Downloader.Torrent;
        }
    }
}

const gamesPlaytime = new Map();
const watchProcesses = async ()=>{
    const games = await gameRepository.find({
        where: {
            executablePath: Not(IsNull()),
            isDeleted: false
        }
    });
    if (games.length === 0) return;
    const processes = await PythonInstance.getProcessList();
    for (const game of games){
        const executablePath = game.executablePath;
        const gameProcess = processes.find((runningProcess)=>{
            return executablePath == runningProcess.exe;
        });
        if (gameProcess) {
            if (gamesPlaytime.has(game.id)) {
                const gamePlaytime = gamesPlaytime.get(game.id);
                const zero = gamePlaytime.lastTick;
                const delta = performance.now() - zero;
                await gameRepository.update(game.id, {
                    playTimeInMilliseconds: game.playTimeInMilliseconds + delta,
                    lastTimePlayed: new Date()
                });
                gamesPlaytime.set(game.id, {
                    ...gamePlaytime,
                    lastTick: performance.now()
                });
            } else {
                if (game.remoteId) {
                    updateGamePlaytime(game, 0, new Date());
                } else {
                    createGame({
                        ...game,
                        lastTimePlayed: new Date()
                    });
                }
                gamesPlaytime.set(game.id, {
                    lastTick: performance.now(),
                    firstTick: performance.now()
                });
            }
        } else if (gamesPlaytime.has(game.id)) {
            const gamePlaytime = gamesPlaytime.get(game.id);
            gamesPlaytime.delete(game.id);
            if (game.remoteId) {
                updateGamePlaytime(game, performance.now() - gamePlaytime.firstTick, game.lastTimePlayed);
            } else {
                createGame(game);
            }
        }
    }
    if (WindowManager.mainWindow) {
        const gamesRunning = Array.from(gamesPlaytime.entries()).map((entry)=>{
            return {
                id: entry[0],
                sessionDurationInMillis: performance.now() - entry[1].firstTick
            };
        });
        WindowManager.mainWindow.webContents.send("on-games-running", gamesRunning);
    }
};

const startMainLoop = async ()=>{
    while(true){
        await Promise.allSettled([
            watchProcesses(),
            DownloadManager.watchDownloads()
        ]);
        await sleep(500);
    }
};

const loadState = async (userPreferences)=>{
    RepacksManager.updateRepacks();
    import('./index-DqjGF8EJ.js');
    if (userPreferences?.realDebridApiToken) RealDebridClient.authorize(userPreferences?.realDebridApiToken);
    HydraApi.setupApi().then(()=>{
        uploadGamesBatch();
    });
    const [nextQueueItem] = await downloadQueueRepository.find({
        order: {
            id: "DESC"
        },
        relations: {
            game: true
        }
    });
    if (nextQueueItem?.game.status === "active") {
        DownloadManager.startDownload(nextQueueItem.game);
    } else {
        PythonInstance.spawn();
    }
    startMainLoop();
    const now = new Date();
    fetchDownloadSourcesAndUpdate().then(async ()=>{
        const newRepacksCount = await repackRepository.count({
            where: {
                createdAt: MoreThan(now)
            }
        });
        if (newRepacksCount > 0) publishNewRepacksNotifications(newRepacksCount);
    });
};
userPreferencesRepository.findOne({
    where: {
        id: 1
    }
}).then((userPreferences)=>{
    loadState(userPreferences);
});

const main = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

export { DownloadManager as D, RealDebridClient as R, createGame as c, fetchDownloadSourcesAndUpdate as f, gamesPlaytime as g, insertDownloadsFromSource as i, main as m, publishNotificationUpdateReadyToInstall as p };
//# sourceMappingURL=main-DXgGqmXm.js.map
