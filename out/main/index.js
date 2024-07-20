;!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="14280237-1120-492a-ba49-ce473e1243e7",e._sentryDebugIdIdentifier="sentry-dbid-14280237-1120-492a-ba49-ce473e1243e7")}catch(e){}}();import { app as app$7, BrowserWindow, nativeImage, Tray, shell, Menu, dialog, protocol, net } from 'electron';
import { init } from '@sentry/electron/main';
import updater from 'electron-updater';
import i18n, { t } from 'i18next';
import path from 'node:path';
import url$1 from 'node:url';
import { is, electronApp, optimizer } from '@electron-toolkit/utils';
import log from 'electron-log';
import path$1, { join } from 'path';
import axios, { AxiosError } from 'axios';
import { JSDOM } from 'jsdom';
import { PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Entity, ManyToOne, OneToOne, JoinColumn, PrimaryColumn, DataSource, IsNull, Not } from 'typeorm';
import { D as DownloadSourceStatus, a as Downloader, U as UserNotLoggedInError, f as formatName } from './index-0S7GjpUn.js';
import url from 'url';
import Piscina from 'piscina';
import UserAgent from 'user-agents';
import cp, { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import 'icojs';
import 'parse-torrent';
import { chunk } from 'lodash-es';
import flexSearch from 'flexsearch';
import Aria2 from 'aria2';


// -- CommonJS Shims --
import __cjs_url__ from 'node:url';
import __cjs_path__ from 'node:path';
import __cjs_mod__ from 'node:module';
const __filename = __cjs_url__.fileURLToPath(import.meta.url);
const __dirname = __cjs_path__.dirname(__filename);
const require = __cjs_mod__.createRequire(import.meta.url);
const defaultDownloadsPath = app$7.getPath("downloads");
const databasePath = path.join(app$7.getPath("appData"), "hydra", "hydra.db");
const logsPath = path.join(app$7.getPath("appData"), "hydra", "logs");
const seedsPath = app$7.isPackaged ? path.join(process.resourcesPath, "seeds") : path.join(__dirname, "..", "..", "seeds");

log.transports.file.resolvePathFn = (_, message)=>{
    if (message?.level === "error") {
        return path$1.join(logsPath, "error.txt");
    }
    if (message?.level === "info") {
        return path$1.join(logsPath, "info.txt");
    }
    return path$1.join(logsPath, "logs.txt");
};
log.errorHandler.startCatching({
    showDialog: false
});
log.initialize();
const logger = log.scope("main");

const requestSteam250 = async (path)=>{
    return axios.get(`https://steam250.com${path}`).then((response)=>{
        const { window } = new JSDOM(response.data);
        const { document } = window;
        return Array.from(document.querySelectorAll(".appline .title a")).map(($title)=>{
            const steamGameUrl = $title.href;
            if (!steamGameUrl) return null;
            return {
                title: $title.textContent,
                objectID: steamGameUrl.split("/").pop()
            };
        }).filter((game)=>game != null);
    }).catch((_)=>[]);
};
const steam250Paths = [
    "/hidden_gems",
    `/${new Date().getFullYear()}`,
    "/top250",
    "/most_played"
];
const getSteam250List = async ()=>{
    const gamesList = (await Promise.all(steam250Paths.map((path)=>requestSteam250(path)))).flat();
    const gamesMap = gamesList.reduce((map, item)=>{
        if (item) map.set(item.objectID, item);
        return map;
    }, new Map());
    return [
        ...gamesMap.values()
    ];
};

const icon = join(__dirname, "../../resources/icon.png");

const trayIcon = join(__dirname, "../../resources/tray-icon.png");

function _ts_decorate$6(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata$6(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
class DownloadSource {
    id;
    url;
    name;
    theguythatrepacked;
    etag;
    downloadCount;
    status;
    repacks;
    createdAt;
    updatedAt;
}
_ts_decorate$6([
    PrimaryGeneratedColumn(),
    _ts_metadata$6("design:type", Number)
], DownloadSource.prototype, "id", void 0);
_ts_decorate$6([
    Column("text", {
        nullable: true,
        unique: true
    }),
    _ts_metadata$6("design:type", String)
], DownloadSource.prototype, "url", void 0);
_ts_decorate$6([
    Column("text"),
    _ts_metadata$6("design:type", String)
], DownloadSource.prototype, "name", void 0);
_ts_decorate$6([
    Column("text"),
    _ts_metadata$6("design:type", String)
], DownloadSource.prototype, "theguythatrepacked", void 0);
_ts_decorate$6([
    Column("text", {
        nullable: true
    }),
    _ts_metadata$6("design:type", Object)
], DownloadSource.prototype, "etag", void 0);
_ts_decorate$6([
    Column("int", {
        default: 0
    }),
    _ts_metadata$6("design:type", Number)
], DownloadSource.prototype, "downloadCount", void 0);
_ts_decorate$6([
    Column("text", {
        default: DownloadSourceStatus.UpToDate
    }),
    _ts_metadata$6("design:type", typeof DownloadSourceStatus === "undefined" ? Object : DownloadSourceStatus)
], DownloadSource.prototype, "status", void 0);
_ts_decorate$6([
    OneToMany("Repack", "downloadSource", {
        cascade: true
    }),
    _ts_metadata$6("design:type", Array)
], DownloadSource.prototype, "repacks", void 0);
_ts_decorate$6([
    CreateDateColumn(),
    _ts_metadata$6("design:type", typeof Date === "undefined" ? Object : Date)
], DownloadSource.prototype, "createdAt", void 0);
_ts_decorate$6([
    UpdateDateColumn(),
    _ts_metadata$6("design:type", typeof Date === "undefined" ? Object : Date)
], DownloadSource.prototype, "updatedAt", void 0);
DownloadSource = _ts_decorate$6([
    Entity("download_source")
], DownloadSource);

function _ts_decorate$5(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata$5(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
class Repack {
    id;
    title;
    magnet;
    page;
    theguythatrepacked;
    fileSize;
    uploadDate;
    downloadSource;
    createdAt;
    updatedAt;
}
_ts_decorate$5([
    PrimaryGeneratedColumn(),
    _ts_metadata$5("design:type", Number)
], Repack.prototype, "id", void 0);
_ts_decorate$5([
    Column("text", {
        unique: true
    }),
    _ts_metadata$5("design:type", String)
], Repack.prototype, "title", void 0);
_ts_decorate$5([
    Column("text", {
        unique: true
    }),
    _ts_metadata$5("design:type", String)
], Repack.prototype, "magnet", void 0);
_ts_decorate$5([
    Column("int", {
        nullable: true
    }),
    _ts_metadata$5("design:type", Number)
], Repack.prototype, "page", void 0);
_ts_decorate$5([
    Column("text"),
    _ts_metadata$5("design:type", String)
], Repack.prototype, "theguythatrepacked", void 0);
_ts_decorate$5([
    Column("text"),
    _ts_metadata$5("design:type", String)
], Repack.prototype, "fileSize", void 0);
_ts_decorate$5([
    Column("datetime"),
    _ts_metadata$5("design:type", Object)
], Repack.prototype, "uploadDate", void 0);
_ts_decorate$5([
    ManyToOne(()=>DownloadSource, {
        nullable: true,
        onDelete: "CASCADE"
    }),
    _ts_metadata$5("design:type", typeof DownloadSource === "undefined" ? Object : DownloadSource)
], Repack.prototype, "downloadSource", void 0);
_ts_decorate$5([
    CreateDateColumn(),
    _ts_metadata$5("design:type", typeof Date === "undefined" ? Object : Date)
], Repack.prototype, "createdAt", void 0);
_ts_decorate$5([
    UpdateDateColumn(),
    _ts_metadata$5("design:type", typeof Date === "undefined" ? Object : Date)
], Repack.prototype, "updatedAt", void 0);
Repack = _ts_decorate$5([
    Entity("repack")
], Repack);

function _ts_decorate$4(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata$4(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let Game$1 = class Game {
    id;
    objectID;
    remoteId;
    title;
    iconUrl;
    folderName;
    downloadPath;
    executablePath;
    playTimeInMilliseconds;
    shop;
    status;
    downloader;
    progress;
    bytesDownloaded;
    lastTimePlayed;
    fileSize;
    uri;
    repack;
    downloadQueue;
    isDeleted;
    createdAt;
    updatedAt;
};
_ts_decorate$4([
    PrimaryGeneratedColumn(),
    _ts_metadata$4("design:type", Number)
], Game$1.prototype, "id", void 0);
_ts_decorate$4([
    Column("text", {
        unique: true
    }),
    _ts_metadata$4("design:type", String)
], Game$1.prototype, "objectID", void 0);
_ts_decorate$4([
    Column("text", {
        unique: true,
        nullable: true
    }),
    _ts_metadata$4("design:type", Object)
], Game$1.prototype, "remoteId", void 0);
_ts_decorate$4([
    Column("text"),
    _ts_metadata$4("design:type", String)
], Game$1.prototype, "title", void 0);
_ts_decorate$4([
    Column("text", {
        nullable: true
    }),
    _ts_metadata$4("design:type", Object)
], Game$1.prototype, "iconUrl", void 0);
_ts_decorate$4([
    Column("text", {
        nullable: true
    }),
    _ts_metadata$4("design:type", Object)
], Game$1.prototype, "folderName", void 0);
_ts_decorate$4([
    Column("text", {
        nullable: true
    }),
    _ts_metadata$4("design:type", Object)
], Game$1.prototype, "downloadPath", void 0);
_ts_decorate$4([
    Column("text", {
        nullable: true
    }),
    _ts_metadata$4("design:type", Object)
], Game$1.prototype, "executablePath", void 0);
_ts_decorate$4([
    Column("int", {
        default: 0
    }),
    _ts_metadata$4("design:type", Number)
], Game$1.prototype, "playTimeInMilliseconds", void 0);
_ts_decorate$4([
    Column("text"),
    _ts_metadata$4("design:type", typeof GameShop === "undefined" ? Object : GameShop)
], Game$1.prototype, "shop", void 0);
_ts_decorate$4([
    Column("text", {
        nullable: true
    }),
    _ts_metadata$4("design:type", Object)
], Game$1.prototype, "status", void 0);
_ts_decorate$4([
    Column("int", {
        default: Downloader.Torrent
    }),
    _ts_metadata$4("design:type", typeof Downloader === "undefined" ? Object : Downloader)
], Game$1.prototype, "downloader", void 0);
_ts_decorate$4([
    Column("float", {
        default: 0
    }),
    _ts_metadata$4("design:type", Number)
], Game$1.prototype, "progress", void 0);
_ts_decorate$4([
    Column("int", {
        default: 0
    }),
    _ts_metadata$4("design:type", Number)
], Game$1.prototype, "bytesDownloaded", void 0);
_ts_decorate$4([
    Column("datetime", {
        nullable: true
    }),
    _ts_metadata$4("design:type", Object)
], Game$1.prototype, "lastTimePlayed", void 0);
_ts_decorate$4([
    Column("float", {
        default: 0
    }),
    _ts_metadata$4("design:type", Number)
], Game$1.prototype, "fileSize", void 0);
_ts_decorate$4([
    Column("text", {
        nullable: true
    }),
    _ts_metadata$4("design:type", Object)
], Game$1.prototype, "uri", void 0);
_ts_decorate$4([
    OneToOne("Repack", "game", {
        nullable: true
    }),
    JoinColumn(),
    _ts_metadata$4("design:type", typeof Repack === "undefined" ? Object : Repack)
], Game$1.prototype, "repack", void 0);
_ts_decorate$4([
    OneToOne("DownloadQueue", "game"),
    _ts_metadata$4("design:type", typeof DownloadQueue === "undefined" ? Object : DownloadQueue)
], Game$1.prototype, "downloadQueue", void 0);
_ts_decorate$4([
    Column("boolean", {
        default: false
    }),
    _ts_metadata$4("design:type", Boolean)
], Game$1.prototype, "isDeleted", void 0);
_ts_decorate$4([
    CreateDateColumn(),
    _ts_metadata$4("design:type", typeof Date === "undefined" ? Object : Date)
], Game$1.prototype, "createdAt", void 0);
_ts_decorate$4([
    UpdateDateColumn(),
    _ts_metadata$4("design:type", typeof Date === "undefined" ? Object : Date)
], Game$1.prototype, "updatedAt", void 0);
Game$1 = _ts_decorate$4([
    Entity("game")
], Game$1);

function _ts_decorate$3(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata$3(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
class UserPreferences {
    id;
    downloadsPath;
    language;
    realDebridApiToken;
    downloadNotificationsEnabled;
    repackUpdatesNotificationsEnabled;
    preferQuitInsteadOfHiding;
    runAtStartup;
    createdAt;
    updatedAt;
}
_ts_decorate$3([
    PrimaryGeneratedColumn(),
    _ts_metadata$3("design:type", Number)
], UserPreferences.prototype, "id", void 0);
_ts_decorate$3([
    Column("text", {
        nullable: true
    }),
    _ts_metadata$3("design:type", Object)
], UserPreferences.prototype, "downloadsPath", void 0);
_ts_decorate$3([
    Column("text", {
        default: "en"
    }),
    _ts_metadata$3("design:type", String)
], UserPreferences.prototype, "language", void 0);
_ts_decorate$3([
    Column("text", {
        nullable: true
    }),
    _ts_metadata$3("design:type", Object)
], UserPreferences.prototype, "realDebridApiToken", void 0);
_ts_decorate$3([
    Column("boolean", {
        default: false
    }),
    _ts_metadata$3("design:type", Boolean)
], UserPreferences.prototype, "downloadNotificationsEnabled", void 0);
_ts_decorate$3([
    Column("boolean", {
        default: false
    }),
    _ts_metadata$3("design:type", Boolean)
], UserPreferences.prototype, "repackUpdatesNotificationsEnabled", void 0);
_ts_decorate$3([
    Column("boolean", {
        default: false
    }),
    _ts_metadata$3("design:type", Boolean)
], UserPreferences.prototype, "preferQuitInsteadOfHiding", void 0);
_ts_decorate$3([
    Column("boolean", {
        default: false
    }),
    _ts_metadata$3("design:type", Boolean)
], UserPreferences.prototype, "runAtStartup", void 0);
_ts_decorate$3([
    CreateDateColumn(),
    _ts_metadata$3("design:type", typeof Date === "undefined" ? Object : Date)
], UserPreferences.prototype, "createdAt", void 0);
_ts_decorate$3([
    UpdateDateColumn(),
    _ts_metadata$3("design:type", typeof Date === "undefined" ? Object : Date)
], UserPreferences.prototype, "updatedAt", void 0);
UserPreferences = _ts_decorate$3([
    Entity("user_preferences")
], UserPreferences);

function _ts_decorate$2(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata$2(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
class GameShopCache {
    objectID;
    shop;
    serializedData;
    howLongToBeatSerializedData;
    language;
    createdAt;
    updatedAt;
}
_ts_decorate$2([
    PrimaryColumn("text", {
        unique: true
    }),
    _ts_metadata$2("design:type", String)
], GameShopCache.prototype, "objectID", void 0);
_ts_decorate$2([
    Column("text"),
    _ts_metadata$2("design:type", typeof GameShop === "undefined" ? Object : GameShop)
], GameShopCache.prototype, "shop", void 0);
_ts_decorate$2([
    Column("text", {
        nullable: true
    }),
    _ts_metadata$2("design:type", String)
], GameShopCache.prototype, "serializedData", void 0);
_ts_decorate$2([
    Column("text", {
        nullable: true
    }),
    _ts_metadata$2("design:type", String)
], GameShopCache.prototype, "howLongToBeatSerializedData", void 0);
_ts_decorate$2([
    Column("text", {
        nullable: true
    }),
    _ts_metadata$2("design:type", String)
], GameShopCache.prototype, "language", void 0);
_ts_decorate$2([
    CreateDateColumn(),
    _ts_metadata$2("design:type", typeof Date === "undefined" ? Object : Date)
], GameShopCache.prototype, "createdAt", void 0);
_ts_decorate$2([
    UpdateDateColumn(),
    _ts_metadata$2("design:type", typeof Date === "undefined" ? Object : Date)
], GameShopCache.prototype, "updatedAt", void 0);
GameShopCache = _ts_decorate$2([
    Entity("game_shop_cache")
], GameShopCache);

function _ts_decorate$1(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata$1(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let DownloadQueue$1 = class DownloadQueue {
    id;
    game;
    createdAt;
    updatedAt;
};
_ts_decorate$1([
    PrimaryGeneratedColumn(),
    _ts_metadata$1("design:type", Number)
], DownloadQueue$1.prototype, "id", void 0);
_ts_decorate$1([
    OneToOne("Game", "downloadQueue"),
    JoinColumn(),
    _ts_metadata$1("design:type", typeof Game === "undefined" ? Object : Game)
], DownloadQueue$1.prototype, "game", void 0);
_ts_decorate$1([
    CreateDateColumn(),
    _ts_metadata$1("design:type", typeof Date === "undefined" ? Object : Date)
], DownloadQueue$1.prototype, "createdAt", void 0);
_ts_decorate$1([
    UpdateDateColumn(),
    _ts_metadata$1("design:type", typeof Date === "undefined" ? Object : Date)
], DownloadQueue$1.prototype, "updatedAt", void 0);
DownloadQueue$1 = _ts_decorate$1([
    Entity("download_queue")
], DownloadQueue$1);

function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
class UserAuth {
    id;
    userId;
    displayName;
    profileImageUrl;
    accessToken;
    refreshToken;
    tokenExpirationTimestamp;
    createdAt;
    updatedAt;
}
_ts_decorate([
    PrimaryGeneratedColumn(),
    _ts_metadata("design:type", Number)
], UserAuth.prototype, "id", void 0);
_ts_decorate([
    Column("text", {
        default: ""
    }),
    _ts_metadata("design:type", String)
], UserAuth.prototype, "userId", void 0);
_ts_decorate([
    Column("text", {
        default: ""
    }),
    _ts_metadata("design:type", String)
], UserAuth.prototype, "displayName", void 0);
_ts_decorate([
    Column("text", {
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], UserAuth.prototype, "profileImageUrl", void 0);
_ts_decorate([
    Column("text", {
        default: ""
    }),
    _ts_metadata("design:type", String)
], UserAuth.prototype, "accessToken", void 0);
_ts_decorate([
    Column("text", {
        default: ""
    }),
    _ts_metadata("design:type", String)
], UserAuth.prototype, "refreshToken", void 0);
_ts_decorate([
    Column("int", {
        default: 0
    }),
    _ts_metadata("design:type", Number)
], UserAuth.prototype, "tokenExpirationTimestamp", void 0);
_ts_decorate([
    CreateDateColumn(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], UserAuth.prototype, "createdAt", void 0);
_ts_decorate([
    UpdateDateColumn(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], UserAuth.prototype, "updatedAt", void 0);
UserAuth = _ts_decorate([
    Entity("user_auth")
], UserAuth);

class FixRepackUploadDate1715900413313 {
    async up(_) {
        return;
    }
    async down(_) {
        return;
    }
}

class AlterLastTimePlayedToDatime1716776027208 {
    async up(queryRunner) {
        const updateLastTimePlayedValues = `
        UPDATE game SET lastTimePlayed = (SELECT 
            SUBSTR(lastTimePlayed, 13, 4) || '-' ||    -- Year
            CASE SUBSTR(lastTimePlayed, 9, 3)
                WHEN 'Jan' THEN '01'
                WHEN 'Feb' THEN '02'
                WHEN 'Mar' THEN '03'
                WHEN 'Apr' THEN '04'
                WHEN 'May' THEN '05'
                WHEN 'Jun' THEN '06'
                WHEN 'Jul' THEN '07'
                WHEN 'Aug' THEN '08'
                WHEN 'Sep' THEN '09'
                WHEN 'Oct' THEN '10'
                WHEN 'Nov' THEN '11'
                WHEN 'Dec' THEN '12'
            END || '-' ||                          -- Month
            SUBSTR(lastTimePlayed, 6, 2) || ' ' ||     -- Day
            SUBSTR(lastTimePlayed, 18, 8)              -- hh:mm:ss;
            FROM game)
            WHERE lastTimePlayed IS NOT NULL;
            `;
        await queryRunner.query(updateLastTimePlayedValues);
    }
    async down(queryRunner) {
        const queryBuilder = queryRunner.manager.createQueryBuilder(Game$1, "game");
        const result = await queryBuilder.getMany();
        for (const game of result){
            if (!game.lastTimePlayed) continue;
            await queryRunner.query(`UPDATE game set lastTimePlayed = ? WHERE id = ?;`, [
                game.lastTimePlayed.toUTCString(),
                game.id
            ]);
        }
    }
}

const migrations = [
    FixRepackUploadDate1715900413313,
    AlterLastTimePlayedToDatime1716776027208
];

const createDataSource = (options)=>new DataSource({
        type: "better-sqlite3",
        entities: [
            Game$1,
            Repack,
            UserPreferences,
            GameShopCache,
            DownloadSource,
            DownloadQueue$1,
            UserAuth
        ],
        synchronize: true,
        database: databasePath,
        ...options
    });
const dataSource = createDataSource({
    migrations
});

const gameRepository = dataSource.getRepository(Game$1);
const repackRepository = dataSource.getRepository(Repack);
const userPreferencesRepository = dataSource.getRepository(UserPreferences);
const gameShopCacheRepository = dataSource.getRepository(GameShopCache);
const downloadSourceRepository = dataSource.getRepository(DownloadSource);
const downloadQueueRepository = dataSource.getRepository(DownloadQueue$1);
const userAuthRepository = dataSource.getRepository(UserAuth);

const steamGamesWorkerPath = join(__dirname, "./steam-games.worker-DXB1vbxe.js");

const downloadSourceWorkerPath = join(__dirname, "./download-source.worker-MDfWiJzP.js");

const steamGamesWorker = new Piscina({
    filename: steamGamesWorkerPath,
    workerData: {
        steamGamesPath: path.join(seedsPath, "steam-games.json")
    },
    maxThreads: 1
});
const downloadSourceWorker = new Piscina({
    filename: downloadSourceWorkerPath
});

const getSteamAppAsset = (category, objectID, clientIcon)=>{
    if (category === "library") return `https://steamcdn-a.akamaihd.net/steam/apps/${objectID}/header.jpg`;
    if (objectID === "0") return `./library/${clientIcon}.png`;
    if (category === "hero") return `https://steamcdn-a.akamaihd.net/steam/apps/${objectID}/library_hero.jpg`;
    if (objectID === "0") return `./hero/${clientIcon}.png`;
    if (category === "logo") return `https://cdn.cloudflare.steamstatic.com/steam/apps/${objectID}/logo.png`;
    if (objectID === "0") return `./logo/${clientIcon}.png`;
    return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${objectID}/${clientIcon}.ico`;
};
const getFileBase64 = async (url)=>fetch(url, {
        method: "GET"
    }).then((response)=>response.arrayBuffer().then((buffer)=>{
            const base64 = Buffer.from(buffer).toString("base64");
            const contentType = response.headers.get("content-type");
            return `data:${contentType};base64,${base64}`;
        }));
const sleep = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
const requestWebPage = async (url)=>{
    const userAgent = new UserAgent();
    return axios.get(url, {
        headers: {
            "User-Agent": userAgent.toString()
        }
    }).then((response)=>response.data);
};

const mergeWithRemoteGames = async ()=>{
    return HydraApi.get("/games").then(async (response)=>{
        for (const game of response.data){
            const localGame = await gameRepository.findOne({
                where: {
                    objectID: game.objectId
                }
            });
            if (localGame) {
                const updatedLastTimePlayed = localGame.lastTimePlayed == null || game.lastTimePlayed && new Date(game.lastTimePlayed) > localGame.lastTimePlayed ? game.lastTimePlayed : localGame.lastTimePlayed;
                const updatedPlayTime = localGame.playTimeInMilliseconds < game.playTimeInMilliseconds ? game.playTimeInMilliseconds : localGame.playTimeInMilliseconds;
                gameRepository.update({
                    objectID: game.objectId,
                    shop: "steam"
                }, {
                    remoteId: game.id,
                    lastTimePlayed: updatedLastTimePlayed,
                    playTimeInMilliseconds: updatedPlayTime
                });
            } else {
                const steamGame = await steamGamesWorker.run(Number(game.objectId), {
                    name: "getById"
                });
                if (steamGame) {
                    const iconUrl = steamGame?.clientIcon ? getSteamAppAsset("icon", game.objectId, steamGame.clientIcon) : null;
                    gameRepository.insert({
                        objectID: game.objectId,
                        title: steamGame?.name,
                        remoteId: game.id,
                        shop: game.shop,
                        iconUrl,
                        lastTimePlayed: game.lastTimePlayed,
                        playTimeInMilliseconds: game.playTimeInMilliseconds
                    });
                }
            }
        }
    }).catch(()=>{});
};

const uploadGamesBatch = async ()=>{
    const games = await gameRepository.find({
        where: {
            remoteId: IsNull(),
            isDeleted: false
        }
    });
    const gamesChunks = chunk(games, 200);
    for (const chunk of gamesChunks){
        await HydraApi.post("/games/batch", chunk.map((game)=>{
            return {
                objectId: game.objectID,
                playTimeInMilliseconds: Math.trunc(game.playTimeInMilliseconds),
                shop: game.shop,
                lastTimePlayed: game.lastTimePlayed
            };
        })).catch(()=>{});
    }
    await mergeWithRemoteGames();
    if (WindowManager.mainWindow) WindowManager.mainWindow.webContents.send("on-library-batch-complete");
};

const clearGamesRemoteIds = ()=>{
    return gameRepository.update({}, {
        remoteId: null
    });
};

var define_import_meta_env_default$1 = { BASE_URL: "/", MODE: "development", DEV: true, PROD: false, SSR: true };
class HydraApi {
  static instance;
  static EXPIRATION_OFFSET_IN_MS = 1e3 * 60 * 5;
  static secondsToMilliseconds = (seconds) => seconds * 1e3;
  static userAuth = {
    authToken: "",
    refreshToken: "",
    expirationTimestamp: 0
  };
  static isLoggedIn() {
    return this.userAuth.authToken !== "";
  }
  static async handleExternalAuth(uri) {
    const { payload } = url.parse(uri, true).query;
    const decodedBase64 = atob(payload);
    const jsonData = JSON.parse(decodedBase64);
    const { accessToken, expiresIn, refreshToken } = jsonData;
    const now = /* @__PURE__ */ new Date();
    const tokenExpirationTimestamp = now.getTime() + this.secondsToMilliseconds(expiresIn) - this.EXPIRATION_OFFSET_IN_MS;
    this.userAuth = {
      authToken: accessToken,
      refreshToken,
      expirationTimestamp: tokenExpirationTimestamp
    };
    await userAuthRepository.upsert({
      id: 1,
      accessToken,
      tokenExpirationTimestamp,
      refreshToken
    }, [
      "id"
    ]);
    if (WindowManager.mainWindow) {
      WindowManager.mainWindow.webContents.send("on-signin");
      await clearGamesRemoteIds();
      uploadGamesBatch();
    }
  }
  static async setupApi() {
    this.instance = axios.create({
      baseURL: define_import_meta_env_default$1.MAIN_VITE_API_URL
    });
    this.instance.interceptors.request.use((request) => {
      logger.log(" ---- REQUEST -----");
      logger.log(request.method, request.url, request.data);
      return request;
    }, (error) => {
      logger.log("request error", error);
      return Promise.reject(error);
    });
    this.instance.interceptors.response.use((response) => {
      logger.log(" ---- RESPONSE -----");
      logger.log(response.status, response.config.method, response.config.url, response.data);
      return response;
    }, (error) => {
      logger.error(" ---- RESPONSE ERROR -----");
      const { config } = error;
      logger.error(config.method, config.baseURL, config.url, config.headers);
      if (error.response) {
        logger.error(error.response.status, error.response.data);
      } else if (error.request) {
        logger.error(error.request);
      } else {
        logger.error("Error", error.message);
      }
      logger.error(" ----- END RESPONSE ERROR -------");
      return Promise.reject(error);
    });
    const userAuth = await userAuthRepository.findOne({
      where: {
        id: 1
      }
    });
    this.userAuth = {
      authToken: userAuth?.accessToken ?? "",
      refreshToken: userAuth?.refreshToken ?? "",
      expirationTimestamp: userAuth?.tokenExpirationTimestamp ?? 0
    };
  }
  static sendSignOutEvent() {
    if (WindowManager.mainWindow) {
      WindowManager.mainWindow.webContents.send("on-signout");
    }
  }
  static async revalidateAccessTokenIfExpired() {
    const now = /* @__PURE__ */ new Date();
    if (this.userAuth.expirationTimestamp < now.getTime()) {
      try {
        const response = await this.instance.post(`/auth/refresh`, {
          refreshToken: this.userAuth.refreshToken
        });
        const { accessToken, expiresIn } = response.data;
        const tokenExpirationTimestamp = now.getTime() + this.secondsToMilliseconds(expiresIn) - this.EXPIRATION_OFFSET_IN_MS;
        this.userAuth.authToken = accessToken;
        this.userAuth.expirationTimestamp = tokenExpirationTimestamp;
        userAuthRepository.upsert({
          id: 1,
          accessToken,
          tokenExpirationTimestamp
        }, [
          "id"
        ]);
      } catch (err) {
        this.handleUnauthorizedError(err);
      }
    }
  }
  static getAxiosConfig() {
    return {
      headers: {
        Authorization: `Bearer ${this.userAuth.authToken}`
      }
    };
  }
  static handleUnauthorizedError = (err) => {
    if (err instanceof AxiosError && err.response?.status === 401) {
      this.userAuth = {
        authToken: "",
        expirationTimestamp: 0,
        refreshToken: ""
      };
      userAuthRepository.delete({
        id: 1
      });
      this.sendSignOutEvent();
    }
    throw err;
  };
  static async get(url2) {
    if (!this.isLoggedIn())
      throw new UserNotLoggedInError();
    await this.revalidateAccessTokenIfExpired();
    return this.instance.get(url2, this.getAxiosConfig()).catch(this.handleUnauthorizedError);
  }
  static async post(url2, data) {
    if (!this.isLoggedIn())
      throw new UserNotLoggedInError();
    await this.revalidateAccessTokenIfExpired();
    return this.instance.post(url2, data, this.getAxiosConfig()).catch(this.handleUnauthorizedError);
  }
  static async put(url2, data) {
    if (!this.isLoggedIn())
      throw new UserNotLoggedInError();
    await this.revalidateAccessTokenIfExpired();
    return this.instance.put(url2, data, this.getAxiosConfig()).catch(this.handleUnauthorizedError);
  }
  static async patch(url2, data) {
    if (!this.isLoggedIn())
      throw new UserNotLoggedInError();
    await this.revalidateAccessTokenIfExpired();
    return this.instance.patch(url2, data, this.getAxiosConfig()).catch(this.handleUnauthorizedError);
  }
  static async delete(url2) {
    if (!this.isLoggedIn())
      throw new UserNotLoggedInError();
    await this.revalidateAccessTokenIfExpired();
    return this.instance.delete(url2, this.getAxiosConfig()).catch(this.handleUnauthorizedError);
  }
}

class WindowManager {
  static mainWindow = null;
  static loadURL(hash = "") {
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      this.mainWindow?.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}#/${hash}`);
    } else {
      this.mainWindow?.loadFile(path.join(__dirname, "../renderer/index.html"), {
        hash
      });
    }
  }
  static createMainWindow() {
    if (this.mainWindow)
      return;
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 720,
      minWidth: 1024,
      minHeight: 540,
      backgroundColor: "#1c1c1c",
      titleBarStyle: "hidden",
      ...process.platform === "linux" ? {
        icon
      } : {},
      trafficLightPosition: {
        x: 16,
        y: 16
      },
      titleBarOverlay: {
        symbolColor: "#DADBE1",
        color: "#151515",
        height: 34
      },
      webPreferences: {
        preload: path.join(__dirname, "../preload/index.mjs"),
        sandbox: false
      },
      show: false
    });
    this.loadURL();
    this.mainWindow.removeMenu();
    this.mainWindow.on("ready-to-show", () => {
      if (!app$7.isPackaged)
        WindowManager.mainWindow?.webContents.openDevTools();
      WindowManager.mainWindow?.show();
    });
    this.mainWindow.on("close", async () => {
      const userPreferences = await userPreferencesRepository.findOne({
        where: {
          id: 1
        }
      });
      if (userPreferences?.preferQuitInsteadOfHiding) {
        app$7.quit();
      }
      WindowManager.mainWindow?.setProgressBar(-1);
    });
  }
  static openAuthWindow() {
    if (this.mainWindow) {
      const authWindow = new BrowserWindow({
        width: 600,
        height: 640,
        backgroundColor: "#1c1c1c",
        parent: this.mainWindow,
        modal: true,
        show: false,
        maximizable: false,
        resizable: false,
        minimizable: false,
        webPreferences: {
          sandbox: false,
          nodeIntegrationInSubFrames: true
        }
      });
      authWindow.removeMenu();
      const searchParams = new URLSearchParams({
        lng: i18n.language
      });
      authWindow.loadURL(`https://auth.hydra.losbroxas.org/?${searchParams.toString()}`);
      authWindow.once("ready-to-show", () => {
        authWindow.show();
      });
      authWindow.webContents.on("will-navigate", (_event, url) => {
        if (url.startsWith("hydralauncher://auth")) {
          authWindow.close();
          HydraApi.handleExternalAuth(url);
        }
      });
    }
  }
  static redirect(hash) {
    if (!this.mainWindow)
      this.createMainWindow();
    this.loadURL(hash);
    if (this.mainWindow?.isMinimized())
      this.mainWindow.restore();
    this.mainWindow?.focus();
  }
  static createSystemTray(language) {
    let tray;
    if (process.platform === "darwin") {
      const macIcon = nativeImage.createFromPath(trayIcon).resize({
        width: 24,
        height: 24
      });
      tray = new Tray(macIcon);
    } else {
      tray = new Tray(trayIcon);
    }
    const updateSystemTray = async () => {
      const games = await gameRepository.find({
        where: {
          isDeleted: false,
          executablePath: Not(IsNull()),
          lastTimePlayed: Not(IsNull())
        },
        take: 5,
        order: {
          lastTimePlayed: "DESC"
        }
      });
      const recentlyPlayedGames = games.map(({ title, executablePath }) => ({
        label: title,
        type: "normal",
        click: async () => {
          if (!executablePath)
            return;
          shell.openPath(executablePath);
        }
      }));
      const contextMenu = Menu.buildFromTemplate([
        {
          label: t("open", {
            ns: "system_tray",
            lng: language
          }),
          type: "normal",
          click: () => {
            if (this.mainWindow) {
              this.mainWindow.show();
            } else {
              this.createMainWindow();
            }
          }
        },
        {
          type: "separator"
        },
        ...recentlyPlayedGames,
        {
          type: "separator"
        },
        {
          label: t("quit", {
            ns: "system_tray",
            lng: language
          }),
          type: "normal",
          click: () => app$7.quit()
        }
      ]);
      return contextMenu;
    };
    const showContextMenu = async () => {
      const contextMenu = await updateSystemTray();
      tray.popUpContextMenu(contextMenu);
    };
    tray.setToolTip("Hydra");
    if (process.platform !== "darwin") {
      tray.addListener("click", () => {
        if (this.mainWindow) {
          if (WindowManager.mainWindow?.isMinimized())
            WindowManager.mainWindow.restore();
          WindowManager.mainWindow?.focus();
          return;
        }
        this.createMainWindow();
      });
      tray.addListener("right-click", showContextMenu);
    } else {
      tray.addListener("click", showContextMenu);
      tray.addListener("right-click", showContextMenu);
    }
  }
}

const binaryNameByPlatform = {
    darwin: "hydra-download-manager",
    linux: "hydra-download-manager",
    win32: "hydra-download-manager.exe"
};
const BITTORRENT_PORT = "5881";
const RPC_PORT = "8084";
const RPC_PASSWORD = crypto.randomBytes(32).toString("hex");
const startTorrentClient = (args)=>{
    const commonArgs = [
        BITTORRENT_PORT,
        RPC_PORT,
        RPC_PASSWORD,
        args ? encodeURIComponent(JSON.stringify(args)) : ""
    ];
    if (app$7.isPackaged) {
        const binaryName = binaryNameByPlatform[process.platform];
        const binaryPath = path.join(process.resourcesPath, "hydra-download-manager", binaryName);
        if (!fs.existsSync(binaryPath)) {
            dialog.showErrorBox("Fatal", "Hydra Download Manager binary not found. Please check if it has been removed by Windows Defender.");
            app$7.quit();
        }
        return cp.spawn(binaryPath, commonArgs, {
            stdio: "inherit",
            windowsHide: true
        });
    } else {
        const scriptPath = path.join(__dirname, "..", "..", "torrent-client", "main.py");
        return cp.spawn("python3", [
            scriptPath,
            ...commonArgs
        ], {
            stdio: "inherit"
        });
    }
};

const calculateETA = (totalLength, completedLength, speed)=>{
    const remainingBytes = totalLength - completedLength;
    if (remainingBytes >= 0 && speed > 0) {
        return remainingBytes / speed * 1000;
    }
    return -1;
};

var LibtorrentStatus;
(function(LibtorrentStatus) {
    LibtorrentStatus[LibtorrentStatus["CheckingFiles"] = 1] = "CheckingFiles";
    LibtorrentStatus[LibtorrentStatus["DownloadingMetadata"] = 2] = "DownloadingMetadata";
    LibtorrentStatus[LibtorrentStatus["Downloading"] = 3] = "Downloading";
    LibtorrentStatus[LibtorrentStatus["Finished"] = 4] = "Finished";
    LibtorrentStatus[LibtorrentStatus["Seeding"] = 5] = "Seeding";
})(LibtorrentStatus || (LibtorrentStatus = {}));

class PythonInstance {
    static pythonProcess = null;
    static downloadingGameId = -1;
    static rpc = axios.create({
        baseURL: `http://localhost:${RPC_PORT}`,
        headers: {
            "x-hydra-rpc-password": RPC_PASSWORD
        }
    });
    static spawn(args) {
        this.pythonProcess = startTorrentClient(args);
    }
    static kill() {
        if (this.pythonProcess) {
            this.pythonProcess.kill();
            this.pythonProcess = null;
            this.downloadingGameId = -1;
        }
    }
    static killTorrent() {
        if (this.pythonProcess) {
            this.rpc.post("/action", {
                action: "kill-torrent"
            });
            this.downloadingGameId = -1;
        }
    }
    static async getProcessList() {
        return (await this.rpc.get("/process-list")).data || [];
    }
    static async getStatus() {
        if (this.downloadingGameId === -1) return null;
        const response = await this.rpc.get("/status");
        if (response.data === null) return null;
        try {
            const { progress, numPeers, numSeeds, downloadSpeed, bytesDownloaded, fileSize, folderName, status, gameId } = response.data;
            this.downloadingGameId = gameId;
            const isDownloadingMetadata = status === LibtorrentStatus.DownloadingMetadata;
            const isCheckingFiles = status === LibtorrentStatus.CheckingFiles;
            if (!isDownloadingMetadata && !isCheckingFiles) {
                const update = {
                    bytesDownloaded,
                    fileSize,
                    progress,
                    status: "active"
                };
                await gameRepository.update({
                    id: gameId
                }, {
                    ...update,
                    folderName
                });
            }
            if (progress === 1 && !isCheckingFiles) {
                this.downloadingGameId = -1;
            }
            return {
                numPeers,
                numSeeds,
                downloadSpeed,
                timeRemaining: calculateETA(fileSize, bytesDownloaded, downloadSpeed),
                isDownloadingMetadata,
                isCheckingFiles,
                progress,
                gameId
            };
        } catch (err) {
            return null;
        }
    }
    static async pauseDownload() {
        await this.rpc.post("/action", {
            action: "pause",
            game_id: this.downloadingGameId
        }).catch(()=>{});
        this.downloadingGameId = -1;
    }
    static async startDownload(game) {
        if (!this.pythonProcess) {
            this.spawn({
                game_id: game.id,
                magnet: game.uri,
                save_path: game.downloadPath
            });
        } else {
            await this.rpc.post("/action", {
                action: "start",
                game_id: game.id,
                magnet: game.uri,
                save_path: game.downloadPath
            });
        }
        this.downloadingGameId = game.id;
    }
    static async cancelDownload(gameId) {
        await this.rpc.post("/action", {
            action: "cancel",
            game_id: gameId
        }).catch(()=>{});
        this.downloadingGameId = -1;
    }
}

const startAria2 = ()=>{
    const binaryPath = app$7.isPackaged ? path.join(process.resourcesPath, "aria2", "aria2c") : path.join(__dirname, "..", "..", "aria2", "aria2c");
    return spawn(binaryPath, [
        "--enable-rpc",
        "--rpc-listen-all",
        "--file-allocation=none",
        "--allow-overwrite=true"
    ], {
        stdio: "inherit",
        windowsHide: true
    });
};

class HttpDownload {
    static connected = false;
    static aria2c = null;
    static aria2 = new Aria2({});
    static async connect() {
        this.aria2c = startAria2();
        let retries = 0;
        while(retries < 4 && !this.connected){
            try {
                await this.aria2.open();
                logger.log("Connected to aria2");
                this.connected = true;
            } catch (err) {
                await sleep(100);
                logger.log("Failed to connect to aria2, retrying...");
                retries++;
            }
        }
    }
    static getStatus(gid) {
        if (this.connected) {
            return this.aria2.call("tellStatus", gid);
        }
        return null;
    }
    static disconnect() {
        if (this.aria2c) {
            this.aria2c.kill();
            this.connected = false;
        }
    }
    static async cancelDownload(gid) {
        await this.aria2.call("forceRemove", gid);
    }
    static async pauseDownload(gid) {
        await this.aria2.call("forcePause", gid);
    }
    static async resumeDownload(gid) {
        await this.aria2.call("unpause", gid);
    }
    static async startDownload(downloadPath, downloadUrl) {
        if (!this.connected) await this.connect();
        const options = {
            dir: downloadPath
        };
        return this.aria2.call("addUri", [
            downloadUrl
        ], options);
    }
}

class RepacksManager {
    static repacks = [];
    static repacksIndex = new flexSearch.Index();
    static async updateRepacks() {
        this.repacks = await repackRepository.find({
            order: {
                createdAt: "DESC"
            }
        });
        for(let i = 0; i < this.repacks.length; i++){
            this.repacksIndex.remove(i);
        }
        this.repacksIndex = new flexSearch.Index();
        for(let i = 0; i < this.repacks.length; i++){
            const repack = this.repacks[i];
            const formattedTitle = formatName(repack.title);
            this.repacksIndex.add(i, formattedTitle);
        }
    }
    static search(options) {
        return this.repacksIndex.search({
            ...options,
            query: formatName(options.query ?? "")
        }).map((index)=>this.repacks[index]);
    }
    static findRepacksForCatalogueEntries(entries) {
        return entries.map((entry)=>{
            const repacks = this.search({
                query: formatName(entry.title)
            });
            return {
                ...entry,
                repacks
            };
        });
    }
}

const app$6 = {
	successfully_signed_in: "Successfully signed in"
};
const home$k = {
	featured: "Featured",
	trending: "Trending",
	surprise_me: "Surprise me",
	no_results: "No results found"
};
const sidebar$k = {
	catalogue: "Catalogue",
	downloads: "Downloads",
	settings: "Settings",
	my_library: "My library",
	downloading_metadata: "{{title}} (Downloading metadata…)",
	paused: "{{title}} (Paused)",
	downloading: "{{title}} ({{percentage}} - Downloading…)",
	filter: "Filter library",
	home: "Home",
	queued: "{{title}} (Queued)",
	game_has_no_executable: "Game has no executable selected",
	sign_in: "Sign in"
};
const header$k = {
	search: "Search games",
	home: "Home",
	catalogue: "Catalogue",
	downloads: "Downloads",
	search_results: "Search results",
	settings: "Settings",
	version_available_install: "Version {{version}} available. Click here to restart and install.",
	version_available_download: "Version {{version}} available. Click here to download."
};
const bottom_panel$k = {
	no_downloads_in_progress: "No downloads in progress",
	downloading_metadata: "Downloading {{title}} metadata…",
	downloading: "Downloading {{title}}… ({{percentage}} complete) - Conclusion {{eta}} - {{speed}}",
	calculating_eta: "Downloading {{title}}… ({{percentage}} complete) - Calculating remaining time…",
	checking_files: "Checking {{title}} files… ({{percentage}} complete)"
};
const catalogue$k = {
	next_page: "Next page",
	previous_page: "Previous page"
};
const game_details$k = {
	open_download_options: "Open download options",
	download_options_zero: "No download option",
	download_options_one: "{{count}} download option",
	download_options_other: "{{count}} download options",
	updated_at: "Updated {{updated_at}}",
	install: "Install",
	resume: "Resume",
	pause: "Pause",
	cancel: "Cancel",
	remove: "Remove",
	space_left_on_disk: "{{space}} left on disk",
	eta: "Conclusion {{eta}}",
	calculating_eta: "Calculating remaining time…",
	downloading_metadata: "Downloading metadata…",
	filter: "Filter repacks",
	requirements: "System requirements",
	minimum: "Minimum",
	recommended: "Recommended",
	paused: "Paused",
	release_date: "Released on {{date}}",
	publisher: "Published by {{publisher}}",
	hours: "hours",
	minutes: "minutes",
	amount_hours: "{{amount}} hours",
	amount_minutes: "{{amount}} minutes",
	accuracy: "{{accuracy}}% accuracy",
	add_to_library: "Add to library",
	remove_from_library: "Remove from library",
	no_downloads: "No downloads available",
	play_time: "Played for {{amount}}",
	last_time_played: "Last played {{period}}",
	not_played_yet: "You haven't played {{title}} yet",
	next_suggestion: "Next suggestion",
	play: "Play",
	deleting: "Deleting installer…",
	close: "Close",
	playing_now: "Playing now",
	change: "Change",
	repacks_modal_description: "Choose the repack you want to download",
	select_folder_hint: "To change the default folder, go to the <0>Settings</0>",
	download_now: "Download now",
	no_shop_details: "Could not retrieve shop details.",
	download_options: "Download options",
	download_path: "Download path",
	previous_screenshot: "Previous screenshot",
	next_screenshot: "Next screenshot",
	screenshot: "Screenshot {{number}}",
	open_screenshot: "Open screenshot {{number}}",
	download_settings: "Download settings",
	downloader: "Downloader",
	select_executable: "Select",
	no_executable_selected: "No executable selected",
	open_folder: "Open folder",
	open_download_location: "See downloaded files",
	create_shortcut: "Create desktop shortcut",
	remove_files: "Remove files",
	remove_from_library_title: "Are you sure?",
	remove_from_library_description: "This will remove {{game}} from your library",
	options: "Options",
	executable_section_title: "Executable",
	executable_section_description: "Path of the file that will be executed when \"Play\" is clicked",
	downloads_secion_title: "Downloads",
	downloads_section_description: "Check out updates or other versions of this game",
	danger_zone_section_title: "Danger zone",
	danger_zone_section_description: "Remove this game from your library or the files downloaded by Hydra",
	download_in_progress: "Download in progress",
	download_paused: "Download paused",
	last_downloaded_option: "Last downloaded option",
	create_shortcut_success: "Shortcut created successfully",
	create_shortcut_error: "Error creating shortcut"
};
const activation$k = {
	title: "Activate Hydra",
	installation_id: "Installation ID:",
	enter_activation_code: "Enter your activation code",
	message: "If you don't know where to ask for this, then you shouldn't have this.",
	activate: "Activate",
	loading: "Loading…"
};
const downloads$k = {
	resume: "Resume",
	pause: "Pause",
	eta: "Conclusion {{eta}}",
	paused: "Paused",
	verifying: "Verifying…",
	completed: "Completed",
	removed: "Not downloaded",
	cancel: "Cancel",
	filter: "Filter downloaded games",
	remove: "Remove",
	downloading_metadata: "Downloading metadata…",
	deleting: "Deleting installer…",
	"delete": "Remove installer",
	delete_modal_title: "Are you sure?",
	delete_modal_description: "This will remove all the installation files from your computer",
	install: "Install",
	download_in_progress: "In progress",
	queued_downloads: "Queued downloads",
	downloads_completed: "Completed",
	queued: "Queued",
	no_downloads_title: "Such empty",
	no_downloads_description: "You haven't downloaded anything with Hydra yet, but it's never too late to start.",
	checking_files: "Checking files…"
};
const settings$k = {
	downloads_path: "Downloads path",
	change: "Update",
	notifications: "Notifications",
	enable_download_notifications: "When a download is complete",
	enable_repack_list_notifications: "When a new repack is added",
	real_debrid_api_token_label: "Real-Debrid API token",
	quit_app_instead_hiding: "Don't hide Hydra when closing",
	launch_with_system: "Launch Hydra on system start-up",
	general: "General",
	behavior: "Behavior",
	download_sources: "Download sources",
	language: "Language",
	real_debrid_api_token: "API Token",
	enable_real_debrid: "Enable Real-Debrid",
	real_debrid_description: "Real-Debrid is an unrestricted downloader that allows you to download files instantly and at the best of your Internet speed.",
	real_debrid_invalid_token: "Invalid API token",
	real_debrid_api_token_hint: "You can get your API token <0>here</0>",
	real_debrid_free_account_error: "The account \"{{username}}\" is a free account. Please subscribe to Real-Debrid",
	real_debrid_linked_message: "Account \"{{username}}\" linked",
	save_changes: "Save changes",
	changes_saved: "Changes successfully saved",
	download_sources_description: "Hydra will fetch the download links from these sources. The source URL must be a direct link to a .json file containing the download links.",
	validate_download_source: "Validate",
	remove_download_source: "Remove",
	add_download_source: "Add source",
	download_count_zero: "No downloads in list",
	download_count_one: "{{countFormatted}} download in list",
	download_count_other: "{{countFormatted}} downloads in list",
	download_options_zero: "No download available",
	download_options_one: "{{countFormatted}} download available",
	download_options_other: "{{countFormatted}} downloads available",
	download_source_url: "Download source URL",
	add_download_source_description: "Insert the URL containing the .json file",
	download_source_up_to_date: "Up-to-date",
	download_source_errored: "Errored",
	sync_download_sources: "Sync sources",
	removed_download_source: "Download source removed",
	added_download_source: "Added download source",
	download_sources_synced: "All download sources are synced",
	insert_valid_json_url: "Insert a valid JSON url",
	found_download_option_zero: "No download option found",
	found_download_option_one: "Found {{countFormatted}} download option",
	found_download_option_other: "Found {{countFormatted}} download options",
	"import": "Import"
};
const notifications$j = {
	download_complete: "Download complete",
	game_ready_to_install: "{{title}} is ready to install",
	repack_list_updated: "Repack list updated",
	repack_count_one: "{{count}} repack added",
	repack_count_other: "{{count}} repacks added",
	new_update_available: "Version {{version}} available",
	restart_to_install_update: "Restart Hydra to install the update"
};
const system_tray$j = {
	open: "Open Hydra",
	quit: "Quit"
};
const game_card$j = {
	no_downloads: "No downloads available"
};
const binary_not_found_modal$j = {
	title: "Programs not installed",
	description: "Wine or Lutris executables were not found on your system",
	instructions: "Check the correct way to install any of them on your Linux distro so that the game can run normally"
};
const modal$i = {
	close: "Close button"
};
const forms$6 = {
	toggle_password_visibility: "Toggle password visibility"
};
const user_profile$6 = {
	amount_hours: "{{amount}} hours",
	amount_minutes: "{{amount}} minutes",
	last_time_played: "Last played {{period}}",
	activity: "Recent activity",
	library: "Library",
	total_play_time: "Total playtime: {{amount}}",
	no_recent_activity_title: "Hmmm… nothing here",
	no_recent_activity_description: "You haven't played any games recently. It's time to change that!",
	display_name: "Display name",
	saving: "Saving",
	save: "Save",
	edit_profile: "Edit Profile",
	saved_successfully: "Saved successfully",
	try_again: "Please, try again",
	sign_out_modal_title: "Are you sure?",
	cancel: "Cancel",
	successfully_signed_out: "Successfully signed out",
	sign_out: "Sign out",
	playing_for: "Playing for {{amount}}",
	sign_out_modal_text: "Your library is linked with your current account. When signing out, your library will not be visible anymore, and any progress will not be saved. Continue with sign out?"
};
const translation$k = {
	app: app$6,
	home: home$k,
	sidebar: sidebar$k,
	header: header$k,
	bottom_panel: bottom_panel$k,
	catalogue: catalogue$k,
	game_details: game_details$k,
	activation: activation$k,
	downloads: downloads$k,
	settings: settings$k,
	notifications: notifications$j,
	system_tray: system_tray$j,
	game_card: game_card$j,
	binary_not_found_modal: binary_not_found_modal$j,
	modal: modal$i,
	forms: forms$6,
	user_profile: user_profile$6
};

const app$5 = {
	successfully_signed_in: "Autenticado com sucesso"
};
const home$j = {
	featured: "Destaques",
	trending: "Populares",
	surprise_me: "Surpreenda-me",
	no_results: "Nenhum resultado encontrado"
};
const sidebar$j = {
	catalogue: "Catálogo",
	downloads: "Downloads",
	settings: "Ajustes",
	my_library: "Minha biblioteca",
	downloading_metadata: "{{title}} (Baixando metadados…)",
	paused: "{{title}} (Pausado)",
	downloading: "{{title}} ({{percentage}} - Baixando…)",
	filter: "Filtrar biblioteca",
	home: "Início",
	queued: "{{title}} (Na fila)",
	game_has_no_executable: "Jogo não possui executável selecionado",
	sign_in: "Login"
};
const header$j = {
	search: "Buscar jogos",
	catalogue: "Catálogo",
	downloads: "Downloads",
	search_results: "Resultados da busca",
	settings: "Ajustes",
	home: "Início",
	version_available_install: "Versão {{version}} disponível. Clique aqui para reiniciar e instalar.",
	version_available_download: "Versão {{version}} disponível. Clique aqui para fazer o download."
};
const bottom_panel$j = {
	no_downloads_in_progress: "Sem downloads em andamento",
	downloading_metadata: "Baixando metadados de {{title}}…",
	downloading: "Baixando {{title}}… ({{percentage}} concluído) - Conclusão {{eta}} - {{speed}}",
	calculating_eta: "Baixando {{title}}… ({{percentage}} concluído) - Calculando tempo restante…",
	checking_files: "Verificando arquivos de {{title}}…"
};
const game_details$j = {
	open_download_options: "Ver opções de download",
	download_options_zero: "Sem opções de download",
	download_options_one: "{{count}} opção de download",
	download_options_other: "{{count}} opções de download",
	updated_at: "Atualizado {{updated_at}}",
	resume: "Resumir",
	pause: "Pausar",
	cancel: "Cancelar",
	remove: "Remover",
	space_left_on_disk: "{{space}} livres em disco",
	eta: "Conclusão {{eta}}",
	calculating_eta: "Calculando tempo restante…",
	downloading_metadata: "Baixando metadados…",
	filter: "Filtrar repacks",
	requirements: "Requisitos do sistema",
	minimum: "Mínimos",
	recommended: "Recomendados",
	paused: "Pausado",
	release_date: "Lançado em {{date}}",
	publisher: "Publicado por {{publisher}}",
	hours: "horas",
	minutes: "minutos",
	amount_hours: "{{amount}} horas",
	amount_minutes: "{{amount}} minutos",
	accuracy: "{{accuracy}}% de precisão",
	add_to_library: "Adicionar à biblioteca",
	remove_from_library: "Remover da biblioteca",
	no_downloads: "Nenhum download disponível",
	play_time: "Jogado por {{amount}}",
	next_suggestion: "Próxima sugestão",
	install: "Instalar",
	last_time_played: "Jogou por último {{period}}",
	play: "Jogar",
	not_played_yet: "Você ainda não jogou {{title}}",
	close: "Fechar",
	deleting: "Excluindo instalador…",
	playing_now: "Jogando agora",
	change: "Mudar",
	repacks_modal_description: "Escolha o repack do jogo que deseja baixar",
	select_folder_hint: "Para trocar o diretório padrão, acesse a <0>Tela de Ajustes</0>",
	download_now: "Iniciar download",
	no_shop_details: "Não foi possível obter os detalhes da loja.",
	download_options: "Opções de download",
	download_path: "Diretório de download",
	previous_screenshot: "Captura de tela anterior",
	next_screenshot: "Próxima captura de tela",
	screenshot: "Captura de tela {{number}}",
	open_screenshot: "Ver captura de tela {{number}}",
	download_settings: "Ajustes do download",
	downloader: "Downloader",
	select_executable: "Selecionar",
	no_executable_selected: "Nenhum executável selecionado",
	open_folder: "Abrir pasta",
	open_download_location: "Ver arquivos baixados",
	create_shortcut: "Criar atalho na área de trabalho",
	remove_files: "Remover arquivos",
	options: "Opções",
	remove_from_library_description: "Isso irá remover {{game}} da sua biblioteca",
	remove_from_library_title: "Tem certeza?",
	executable_section_title: "Executável",
	executable_section_description: "O caminho do arquivo que será executado ao clicar em \"Jogar\"",
	downloads_secion_title: "Downloads",
	downloads_section_description: "Confira atualizações ou versões diferentes para este mesmo título",
	danger_zone_section_title: "Zona de perigo",
	danger_zone_section_description: "Remova o jogo da sua biblioteca ou os arquivos que foram baixados pelo Hydra",
	download_in_progress: "Download em andamento",
	download_paused: "Download pausado",
	last_downloaded_option: "Última opção baixada",
	create_shortcut_success: "Atalho criado com sucesso",
	create_shortcut_error: "Erro ao criar atalho"
};
const activation$j = {
	title: "Ativação",
	installation_id: "ID da instalação:",
	enter_activation_code: "Insira seu código de ativação",
	message: "Se você não sabe onde conseguir o código, talvez você não devesse estar aqui.",
	activate: "Ativar",
	loading: "Carregando…"
};
const downloads$j = {
	resume: "Resumir",
	pause: "Pausar",
	eta: "Conclusão {{eta}}",
	paused: "Pausado",
	verifying: "Verificando…",
	completed: "Concluído",
	removed: "Cancelado",
	cancel: "Cancelar",
	filter: "Filtrar jogos baixados",
	remove: "Remover",
	downloading_metadata: "Baixando metadados…",
	"delete": "Remover instalador",
	delete_modal_description: "Isso removerá todos os arquivos de instalação do seu computador",
	delete_modal_title: "Tem certeza?",
	deleting: "Excluindo instalador…",
	install: "Instalar",
	download_in_progress: "Baixando agora",
	queued_downloads: "Na fila",
	downloads_completed: "Completo",
	queued: "Na fila",
	no_downloads_title: "Nada por aqui…",
	no_downloads_description: "Você ainda não baixou nada pelo Hydra, mas nunca é tarde para começar.",
	checking_files: "Verificando arquivos…"
};
const settings$j = {
	downloads_path: "Diretório dos downloads",
	change: "Mudar",
	notifications: "Notificações",
	enable_download_notifications: "Quando um download for concluído",
	enable_repack_list_notifications: "Quando a lista de repacks for atualizada",
	real_debrid_api_token_label: "Token de API do Real-Debrid",
	quit_app_instead_hiding: "Encerrar o Hydra ao invés de minimizá-lo ao fechar",
	launch_with_system: "Iniciar o Hydra junto com o sistema",
	general: "Geral",
	behavior: "Comportamento",
	download_sources: "Fontes de download",
	language: "Idioma",
	real_debrid_api_token: "Token de API",
	enable_real_debrid: "Habilitar Real-Debrid",
	real_debrid_api_token_hint: "Você pode obter seu token de API <0>aqui</0>",
	real_debrid_description: "O Real-Debrid é um downloader sem restrições que permite baixar arquivos instantaneamente e com a melhor velocidade da sua Internet.",
	real_debrid_invalid_token: "Token de API inválido",
	real_debrid_free_account_error: "A conta \"{{username}}\" é uma conta gratuita. Por favor, assine a Real-Debrid",
	real_debrid_linked_message: "Conta \"{{username}}\" vinculada",
	save_changes: "Salvar mudanças",
	changes_saved: "Ajustes salvos com sucesso",
	download_sources_description: "Hydra vai buscar links de download em todas as fonte habilitadas. A URL da fonte deve ser um link direto para um arquivo .json contendo uma lista de links.",
	validate_download_source: "Validar",
	remove_download_source: "Remover",
	add_download_source: "Adicionar fonte",
	download_count_zero: "Sem downloads na lista",
	download_count_one: "{{countFormatted}} download na lista",
	download_count_other: "{{countFormatted}} downloads na lista",
	download_options_zero: "Sem downloads disponíveis",
	download_options_one: "{{countFormatted}} download disponível",
	download_options_other: "{{countFormatted}} downloads disponíveis",
	download_source_url: "URL da fonte",
	add_download_source_description: "Insira a URL contendo o arquivo .json",
	download_source_up_to_date: "Sincronizada",
	download_source_errored: "Falhou",
	sync_download_sources: "Sincronizar",
	removed_download_source: "Fonte removida",
	added_download_source: "Fonte adicionada",
	download_sources_synced: "As fontes foram sincronizadas",
	insert_valid_json_url: "Insira a url de um JSON válido",
	found_download_option_zero: "Nenhuma opção de download encontrada",
	found_download_option_one: "{{countFormatted}} opção de download encontrada",
	found_download_option_other: "{{countFormatted}} opções de download encontradas",
	"import": "Importar"
};
const notifications$i = {
	download_complete: "Download concluído",
	game_ready_to_install: "{{title}} está pronto para ser instalado",
	repack_list_updated: "Lista de repacks atualizada",
	repack_count_one: "{{count}} novo repack",
	repack_count_other: "{{count}} novos repacks",
	new_update_available: "Versão {{version}} disponível",
	restart_to_install_update: "Reinicie o Hydra para instalar a nova versão"
};
const system_tray$i = {
	open: "Abrir Hydra",
	quit: "Fechar"
};
const game_card$i = {
	no_downloads: "Sem downloads disponíveis"
};
const binary_not_found_modal$i = {
	title: "Programas não instalados",
	description: "Não foram encontrados no seu sistema os executáveis do Wine ou Lutris",
	instructions: "Verifique a forma correta de instalar algum deles no seu distro Linux, garantindo assim a execução normal do jogo"
};
const catalogue$j = {
	next_page: "Próxima página",
	previous_page: "Página anterior"
};
const modal$h = {
	close: "Botão de fechar"
};
const forms$5 = {
	toggle_password_visibility: "Alternar visibilidade da senha"
};
const user_profile$5 = {
	amount_hours: "{{amount}} horas",
	amount_minutes: "{{amount}} minutos",
	last_time_played: "Jogou {{period}}",
	activity: "Atividade recente",
	library: "Biblioteca",
	total_play_time: "Tempo total de jogo: {{amount}}",
	no_recent_activity_title: "Hmmm… nada por aqui",
	no_recent_activity_description: "Parece que você não jogou nada recentemente. Que tal começar agora?",
	display_name: "Nome de exibição",
	saving: "Salvando…",
	save: "Salvar",
	edit_profile: "Editar Perfil",
	saved_successfully: "Salvo com sucesso",
	try_again: "Por favor, tente novamente",
	cancel: "Cancelar",
	successfully_signed_out: "Deslogado com sucesso",
	sign_out: "Sair da conta",
	sign_out_modal_title: "Tem certeza?",
	playing_for: "Jogando por {{amount}}",
	sign_out_modal_text: "Sua biblioteca de jogos está associada com a sua conta atual. Ao sair, sua biblioteca não aparecerá mais no Hydra e qualquer progresso não será salvo. Deseja continuar?"
};
const translation$j = {
	app: app$5,
	home: home$j,
	sidebar: sidebar$j,
	header: header$j,
	bottom_panel: bottom_panel$j,
	game_details: game_details$j,
	activation: activation$j,
	downloads: downloads$j,
	settings: settings$j,
	notifications: notifications$i,
	system_tray: system_tray$i,
	game_card: game_card$i,
	binary_not_found_modal: binary_not_found_modal$i,
	catalogue: catalogue$j,
	modal: modal$h,
	forms: forms$5,
	user_profile: user_profile$5
};

const app$4 = {
	successfully_signed_in: "Sesión iniciada correctamente"
};
const home$i = {
	featured: "Destacado",
	trending: "Tendencias",
	surprise_me: "¡Sorpréndeme!",
	no_results: "No se encontraron resultados"
};
const sidebar$i = {
	catalogue: "Catálogo",
	downloads: "Descargas",
	settings: "Ajustes",
	my_library: "Mi biblioteca",
	downloading_metadata: "{{title}} (Descargando metadatos…)",
	paused: "{{title}} (Pausado)",
	downloading: "{{title}} ({{percentage}} - Descargando…)",
	filter: "Buscar en la biblioteca",
	home: "Inicio",
	queued: "{{title}} (En Cola)",
	game_has_no_executable: "El juego no tiene un ejecutable",
	sign_in: "Iniciar sesión"
};
const header$i = {
	search: "Buscar juegos",
	home: "Inicio",
	catalogue: "Catálogo",
	downloads: "Descargas",
	search_results: "Resultados de búsqueda",
	settings: "Ajustes",
	version_available_install: "Version {{version}} disponible. Haz clic aquí para reiniciar e instalar.",
	version_available_download: "Version {{version}} disponible. Haz clic aquí para descargar."
};
const bottom_panel$i = {
	no_downloads_in_progress: "Sin descargas en progreso",
	downloading_metadata: "Descargando metadatos de {{title}}…",
	downloading: "Descargando {{title}}… ({{percentage}} completado) - Finalizando {{eta}} - {{speed}}",
	calculating_eta: "Descargando {{title}}… ({{percentage}} completado) - Calculando tiempo restante…",
	checking_files: "Verificando archivos de {{title}}… ({{percentage}} completado)"
};
const catalogue$i = {
	next_page: "Siguiente página",
	previous_page: "Pagina anterior"
};
const game_details$i = {
	open_download_options: "Ver opciones de descargas",
	download_options_zero: "No hay opciones de descargas disponibles",
	download_options_one: "{{count}} opción de descarga",
	download_options_other: "{{count}} opciones de descargas",
	updated_at: "Actualizado el {{updated_at}}",
	install: "Instalar",
	resume: "Continuar",
	pause: "Pausa",
	cancel: "Cancelar",
	remove: "Eliminar",
	space_left_on_disk: "{{space}} restantes en el disco",
	eta: "Tiempo restante: {{eta}}",
	calculating_eta: "Calculando tiempo restante…",
	downloading_metadata: "Descargando metadatos…",
	filter: "Buscar repacks",
	requirements: "Requisitos del Sistema",
	minimum: "Mínimos",
	recommended: "Recomendados",
	paused: "Pausado",
	release_date: "Fecha de lanzamiento: {{date}}",
	publisher: "Publicado por: {{publisher}}",
	hours: "horas",
	minutes: "minutos",
	amount_hours: "{{amount}} horas",
	amount_minutes: "{{amount}} minutos",
	accuracy: "{{accuracy}}% precisión",
	add_to_library: "Agregar a la biblioteca",
	remove_from_library: "Eliminar de la biblioteca",
	no_downloads: "No hay descargas disponibles",
	play_time: "Jugado por {{amount}}",
	last_time_played: "Jugado por última vez {{period}}",
	not_played_yet: "Aún no has jugado a {{title}}",
	next_suggestion: "Siguiente sugerencia",
	play: "Jugar",
	deleting: "Eliminando instalador…",
	close: "Cerrar",
	playing_now: "Jugando ahora",
	change: "Cambiar",
	repacks_modal_description: "Selecciona el repack que quieres descargar",
	select_folder_hint: "Para cambiar la carpeta predeterminada, ve a <0>Ajustes</0>",
	download_now: "Descargar ahora",
	no_shop_details: "No se pudieron obtener detalles de la tienda.",
	download_options: "Opciones de descarga",
	download_path: "Ruta de descarga",
	previous_screenshot: "Anterior captura",
	next_screenshot: "Siguiente captura",
	screenshot: "Captura {{number}}",
	open_screenshot: "Abrir captura {{number}}",
	download_settings: "Ajustes de descarga",
	downloader: "Método de descarga",
	select_executable: "Seleccionar",
	no_executable_selected: "No se seleccionó un ejecutable",
	open_folder: "Abrir carpeta",
	open_download_location: "Ver archivos descargados",
	create_shortcut: "Crear acceso directo en el escritorio",
	remove_files: "Eliminar archivos",
	remove_from_library_title: "¿Estás seguro?",
	remove_from_library_description: "Esto eliminará {{game}} de tu biblioteca",
	options: "Opciones",
	executable_section_title: "Ejecutable",
	executable_section_description: "Ruta del archivo que se ejecutará cuando se presione \"Jugar\"",
	downloads_secion_title: "Descargas",
	downloads_section_description: "Buscar actualizaciones u otras versiones de este juego",
	danger_zone_section_title: "Zona de Peligro",
	danger_zone_section_description: "Eliminar este juego de tu librería o los archivos descargados por Hydra",
	download_in_progress: "Descarga en progreso",
	download_paused: "Descarga pausada",
	last_downloaded_option: "Última opción descargada",
	create_shortcut_success: "Atajo creado con éxito",
	create_shortcut_error: "Error al crear un atajo"
};
const activation$i = {
	title: "Activar Hydra",
	installation_id: "ID de la Instalación:",
	enter_activation_code: "Introduce tu código de activación",
	message: "Si no sabes donde obtener el código, no deberías de tener esto.",
	activate: "Activar",
	loading: "Cargando…"
};
const downloads$i = {
	resume: "Resumir",
	pause: "Pausa",
	eta: "Finalizando en {{eta}}",
	paused: "En Pausa",
	verifying: "Verificando…",
	completed: "Completado",
	removed: "No descargado",
	cancel: "Cancelar",
	filter: "Buscar juegos descargados",
	remove: "Eliminar",
	downloading_metadata: "Descargando metadatos…",
	deleting: "Eliminando instalador…",
	"delete": "Eliminar instalador",
	delete_modal_title: "¿Estás seguro?",
	delete_modal_description: "Esto eliminará todos los archivos de instalación de tu computadora.",
	install: "Instalar",
	download_in_progress: "En progreso",
	queued_downloads: "Descargas en cola",
	downloads_completed: "Completado",
	queued: "En cola",
	no_downloads_title: "Esto está tan... vacío",
	no_downloads_description: "No has descargado nada con Hydra... aún, ¡pero nunca es tarde para comenzar!.",
	checking_files: "Verificando archivos…"
};
const settings$i = {
	downloads_path: "Ruta de descarga",
	change: "Cambiar",
	notifications: "Notificaciones",
	enable_download_notifications: "Cuando se completa una descarga",
	enable_repack_list_notifications: "Cuando se añade un repack nuevo",
	real_debrid_api_token_label: "Token API de Real-Debrid",
	quit_app_instead_hiding: "Salir de Hydra en vez de minimizar en la bandeja del sistema",
	launch_with_system: "Iniciar Hydra al inicio del sistema",
	general: "General",
	behavior: "Otros",
	download_sources: "Fuentes de descarga",
	language: "Idioma",
	real_debrid_api_token: "Token API",
	enable_real_debrid: "Activar Real-Debrid",
	real_debrid_description: "Real-Debrid es una forma de descargar sin restricciones archivos instantáneamente con la máxima velocidad de tu internet.",
	real_debrid_invalid_token: "Token de API inválido",
	real_debrid_api_token_hint: "Puedes obtener tu clave de API <0>aquí</0>",
	real_debrid_free_account_error: "La cuenta \"{{username}}\" es una cuenta gratuita. Por favor, suscríbete a Real-Debrid",
	real_debrid_linked_message: "Cuenta \"{{username}}\" vinculada",
	save_changes: "Guardar cambios",
	changes_saved: "Ajustes guardados exitosamente",
	download_sources_description: "Hydra buscará los enlaces de descarga de estas fuentes. La URL de origen debe ser un enlace directo a un archivo .json que contenga los enlaces de descarga",
	validate_download_source: "Validar",
	remove_download_source: "Eliminar",
	add_download_source: "Añadir fuente de descarga",
	download_count_zero: "No hay descargas en la lista",
	download_count_one: "{{countFormatted}} descarga en la lista",
	download_count_other: "{{countFormatted}} descargas en la lista",
	download_options_zero: "No hay descargas disponibles",
	download_options_one: "{{countFormatted}} descarga disponible",
	download_options_other: "{{countFormatted}} descargas disponibles",
	download_source_url: "Descargar URL de origen",
	add_download_source_description: "Introduce la URL con el archivo .json",
	download_source_up_to_date: "Al día",
	download_source_errored: "Error",
	sync_download_sources: "Sincronizar fuentes",
	removed_download_source: "Fuente de descarga eliminada",
	added_download_source: "Fuente de descarga añadida",
	download_sources_synced: "Todas las fuentes de descargas están actualizadas.",
	insert_valid_json_url: "Introduce una URL JSON válida",
	found_download_option_zero: "No se encontró una opción de descarga",
	found_download_option_one: "Se encontró {{countFormatted}} opción de descarga",
	found_download_option_other: "Se encontraron {{countFormatted}} opciones de descarga",
	"import": "Importar"
};
const notifications$h = {
	download_complete: "Descarga completada",
	game_ready_to_install: "{{title}} está listo para instalarse",
	repack_list_updated: "Lista de repacks actualizadas",
	repack_count_one: "{{count}} repack ha sido añadido",
	repack_count_other: "{{count}} repacks añadidos",
	new_update_available: "Version {{version}} disponible"
};
const system_tray$h = {
	open: "Abrir Hydra",
	quit: "Salir"
};
const game_card$h = {
	no_downloads: "No hay descargas disponibles"
};
const binary_not_found_modal$h = {
	title: "Programas no instalados",
	description: "Los ejecutables de Wine o Lutris no se encontraron en su sistema",
	instructions: "Comprueba como instalar de forma correcta uno de los dos en tu distro de Linux para ejecutar el juego con normalidad"
};
const modal$g = {
	close: "Botón de cierre"
};
const forms$4 = {
	toggle_password_visibility: "Cambiar visibilidad de contraseña"
};
const user_profile$4 = {
	amount_hours: "{{amount}} horas",
	amount_minutes: "{{amount}} minutos",
	last_time_played: "Última vez jugado {{period}}",
	activity: "Actividad reciente",
	library: "Biblioteca",
	total_play_time: "Total de tiempo jugado: {{amount}}",
	no_recent_activity_title: "Que raro, no hay nada por acá, ¿que tal si jugamos algo para empezar?",
	no_recent_activity_description: "No has jugado ningún juego recientemente, ¡vamos a cambiar eso ahora!",
	display_name: "Nombre a mostrar",
	saving: "Guardando",
	save: "Guardar",
	edit_profile: "Editar perfil",
	saved_successfully: "Guardado exitosamente",
	try_again: "Por favor, intenta de nuevo",
	sign_out_modal_title: "¿Estás seguro?",
	cancel: "Cancelar",
	successfully_signed_out: "Sesión cerrada exitosamente",
	sign_out: "Cerrar sesión",
	playing_for: "Jugando por {{amount}}",
	sign_out_modal_text: "Tu biblioteca se ha vinculado con tu cuenta. Cuando cierres sesión, tú biblioteca ya no será visible y cualquier progreso no se guardará. ¿Continuar con el cierre de sesión?"
};
const translation$i = {
	app: app$4,
	home: home$i,
	sidebar: sidebar$i,
	header: header$i,
	bottom_panel: bottom_panel$i,
	catalogue: catalogue$i,
	game_details: game_details$i,
	activation: activation$i,
	downloads: downloads$i,
	settings: settings$i,
	notifications: notifications$h,
	system_tray: system_tray$h,
	game_card: game_card$h,
	binary_not_found_modal: binary_not_found_modal$h,
	modal: modal$g,
	forms: forms$4,
	user_profile: user_profile$4
};

const home$h = {
	featured: "Uitgelicht",
	trending: "Trending",
	surprise_me: "Verrasing",
	no_results: "Geen resultaten gevonden"
};
const sidebar$h = {
	catalogue: "catalogus",
	downloads: "Downloads",
	settings: "Instellingen",
	my_library: "Mijn Bibliotheek",
	downloading_metadata: "{{title}} (Downloading metadata…)",
	paused: "{{title}} (Gepauzeerd)",
	downloading: "{{title}} ({{percentage}} - Downloading…)",
	filter: "Filter Bibliotheek",
	home: "Home"
};
const header$h = {
	search: "Zoek spellen",
	home: "Home",
	catalogue: "Bibliotheek",
	downloads: "Downloads",
	search_results: "Zoek resultaten",
	settings: "Instellingen"
};
const bottom_panel$h = {
	no_downloads_in_progress: "Geen Downloads bezig",
	downloading_metadata: "Downloading {{title}} metadata…",
	downloading: "Downloading {{title}}… ({{percentage}} complete) - Conclusion {{eta}} - {{speed}}"
};
const catalogue$h = {
	next_page: "Volgende Pagina",
	previous_page: "Vorige Pagina"
};
const game_details$h = {
	open_download_options: "Open download Instellingen",
	download_options_zero: "Geen download Instellingen",
	download_options_one: "{{count}} download Instellingen",
	download_options_other: "{{count}} download Instellingen",
	updated_at: "Geupdate {{updated_at}}",
	install: "Instaleer",
	resume: "Verder gaan",
	pause: "Pauze",
	cancel: "Stoppen",
	remove: "Verwijderen",
	space_left_on_disk: "{{space}} Over op schijf",
	eta: "Conclusie {{eta}}",
	downloading_metadata: "Downloading metadata…",
	filter: "Filter repacks",
	requirements: "Systeem vereisten",
	minimum: "Minimaal",
	recommended: "Aanbevolen",
	release_date: "Uitgebracht op {{date}}",
	publisher: "Gepubliceerd door {{publisher}}",
	hours: "uren",
	minutes: "minuten",
	amount_hours: "{{amount}} uren",
	amount_minutes: "{{amount}} minuten",
	accuracy: "{{accuracy}}% nauwkeurigheid",
	add_to_library: "Toevoegen aan bibliotheek",
	remove_from_library: "Verwijderen uit bibliotheek",
	no_downloads: "Geen downloads beschikbaar",
	play_time: "Voor gespeeld {{amount}}",
	last_time_played: "Laatst gespeeld {{period}}",
	not_played_yet: "Je hebt nog niet gespeeld {{title}}",
	next_suggestion: "Volgende suggestie",
	play: "Speel",
	deleting: "Installatieprogramma verwijderen…",
	close: "Sluiten",
	playing_now: "Speel nu",
	change: "Verander",
	repacks_modal_description: "Kies de herverpakking die u wilt downloaden",
	select_folder_hint: "Om de standaardmap te wijzigen, gaat u naar <0>instellingen</0>",
	download_now: "Download nu"
};
const activation$h = {
	title: "Activeer Hydra",
	installation_id: "Installatie-ID:",
	enter_activation_code: "Voer uw activatiecode in",
	message: "Als je niet weet waar je dit moet vragen, dan moet je dit niet hebben.",
	activate: "Activeren",
	loading: "Bezig met laden…"
};
const downloads$h = {
	resume: "Hervatten",
	pause: "Pauze",
	eta: "Conclusie{{eta}}",
	paused: "Gepauzeerd",
	verifying: "Verifiëren…",
	completed: "Voltooid",
	cancel: "Annuleren",
	filter: "Filter gedownloade games",
	remove: "Verwijderen",
	downloading_metadata: "Metagegevens downloaden",
	deleting: "Installatieprogramma verwijderen…",
	"delete": "Installatieprogramma verwijderen",
	delete_modal_title: "Weet je het zeker?",
	delete_modal_description: "Hiermee worden alle installatiebestanden van uw computer verwijderd",
	install: "Installeren"
};
const settings$h = {
	downloads_path: "Downloadpad",
	change: "Update",
	notifications: "Meldingen",
	enable_download_notifications: "Wanneer een download voltooid is",
	enable_repack_list_notifications: "Wanneer een nieuwe herverpakking wordt toegevoegd",
	real_debrid_api_token_label: "Real-Debrid API token",
	quit_app_instead_hiding: "Sluit Hydra af in plaats van te minimaliseren naar de lade",
	launch_with_system: "Start Hydra bij het opstarten van het systeem",
	general: "Algemeen",
	behavior: "Gedrag",
	enable_real_debrid: "Enable Real-Debrid",
	real_debrid_api_token_hint: "U kunt uw API-sleutel <0>hier</0> verkrijgen.",
	save_changes: "Wijzigingen opslaan"
};
const notifications$g = {
	download_complete: "Download compleet",
	game_ready_to_install: "{{title}} is klaar om te installeren",
	repack_list_updated: "Herpaklijst bijgewerkt",
	repack_count_one: "{{count}} herverpakking toegevoegd",
	repack_count_other: "{{count}} herverpakkingen toegevoegd"
};
const system_tray$g = {
	open: "Open Hydra",
	quit: "Verlaten"
};
const game_card$g = {
	no_downloads: "Geen downloads beschikbaar"
};
const binary_not_found_modal$g = {
	title: "Programma's niet geïnstalleerd",
	description: "Er zijn geen uitvoerbare bestanden van Wine of Lutris gevonden op uw systeem",
	instructions: "Controleer de juiste manier om ze op je Linux-distro te installeren, zodat de game normaal kan werken"
};
const modal$f = {
	close: "Knop Sluiten"
};
const translation$h = {
	home: home$h,
	sidebar: sidebar$h,
	header: header$h,
	bottom_panel: bottom_panel$h,
	catalogue: catalogue$h,
	game_details: game_details$h,
	activation: activation$h,
	downloads: downloads$h,
	settings: settings$h,
	notifications: notifications$g,
	system_tray: system_tray$g,
	game_card: game_card$g,
	binary_not_found_modal: binary_not_found_modal$g,
	modal: modal$f
};

const home$g = {
	featured: "En vedette",
	trending: "Tendance",
	surprise_me: "Surprenez-moi",
	no_results: "Aucun résultat trouvé"
};
const sidebar$g = {
	catalogue: "Catalogue",
	downloads: "Téléchargements",
	settings: "Paramètres",
	my_library: "Ma bibliothèque",
	downloading_metadata: "{{title}} (Téléchargement des métadonnées…)",
	paused: "{{title}} (En pause)",
	downloading: "{{title}} ({{percentage}} - Téléchargement en cours…)",
	filter: "Filtrer la bibliothèque",
	home: "Page d’accueil"
};
const header$g = {
	search: "Recherche",
	catalogue: "Catalogue",
	downloads: "Téléchargements",
	search_results: "Résultats de la recherche",
	settings: "Paramètres",
	home: "Accueil"
};
const bottom_panel$g = {
	no_downloads_in_progress: "Aucun téléchargement en cours",
	downloading_metadata: "Téléchargement des métadonnées de {{title}}…",
	downloading: "Téléchargement de {{title}}… ({{percentage}} terminé) - Fin dans {{eta}} - {{speed}}"
};
const game_details$g = {
	open_download_options: "Ouvrir les options de téléchargement",
	download_options_zero: "Aucune option de téléchargement",
	download_options_one: "{{count}} option de téléchargement",
	download_options_other: "{{count}} options de téléchargement",
	updated_at: "Mis à jour le {{updated_at}}",
	resume: "Reprendre",
	pause: "Pause",
	cancel: "Annuler",
	remove: "Supprimer",
	space_left_on_disk: "{{space}} restant sur le disque",
	eta: "Fin dans {{eta}}",
	downloading_metadata: "Téléchargement des métadonnées en cours…",
	filter: "Filtrer les repacks",
	requirements: "Configuration requise",
	minimum: "Minimum",
	recommended: "Recommandée",
	release_date: "Sorti le {{date}}",
	publisher: "Édité par {{publisher}}",
	hours: "heures",
	minutes: "minutes",
	amount_hours: "{{amount}} heures",
	amount_minutes: "{{amount}} minutes",
	accuracy: "{{accuracy}}% précision",
	add_to_library: "Ajouter à la bibliothèque",
	remove_from_library: "Supprimer de la bibliothèque",
	no_downloads: "Aucun téléchargement disponible",
	next_suggestion: "Suggestion suivante",
	play_time: "Joué pour {{montant}}",
	install: "Installer",
	play: "Jouer",
	not_played_yet: "Vous n'avez pas encore joué à {{title}}",
	close: "Fermer",
	deleting: "Suppression du programme d'installation…",
	playing_now: "Jeu en cours",
	last_time_played: "Dernièrement joué {{période}}"
};
const activation$g = {
	title: "Activer Hydra",
	installation_id: "ID d'installation :",
	enter_activation_code: "Entrez votre code d'activation",
	message: "Si vous ne savez pas où demander ceci, vous ne devriez pas l'avoir.",
	activate: "Activer",
	loading: "Chargement en cours…"
};
const downloads$g = {
	resume: "Reprendre",
	pause: "Pause",
	eta: "Fin dans {{eta}}",
	paused: "En pause",
	verifying: "Vérification en cours…",
	completed: "Terminé",
	cancel: "Annuler",
	filter: "Filtrer les jeux téléchargés",
	remove: "Supprimer",
	downloading_metadata: "Téléchargement des métadonnées en cours…",
	"delete": "Supprimer le programme d'installation",
	delete_modal_description: "Cela supprimera tous les fichiers d'installation de votre ordinateur",
	delete_modal_title: "Es-tu sûr?",
	deleting: "Suppression du programme d'installation…",
	install: "Installer"
};
const settings$g = {
	downloads_path: "Chemin des téléchargements",
	change: "Mettre à jour",
	notifications: "Notifications",
	enable_download_notifications: "Quand un téléchargement est terminé",
	enable_repack_list_notifications: "Quand un nouveau repack est ajouté",
	language: "Langue"
};
const notifications$f = {
	download_complete: "Téléchargement terminé",
	game_ready_to_install: "{{title}} est prêt à être installé",
	repack_list_updated: "Liste de repacks mise à jour",
	repack_count_one: "{{count}} repack ajouté",
	repack_count_other: "{{count}} repacks ajoutés"
};
const system_tray$f = {
	open: "Ouvrir NoFinder",
	quit: "Quitter"
};
const game_card$f = {
	no_downloads: "Aucun téléchargement disponible"
};
const binary_not_found_modal$f = {
	description: "Les exécutables Wine ou Lutris sont introuvables sur votre système",
	instructions: "Vérifiez la bonne façon d'installer l'un d'entre eux sur votre distribution Linux afin que le jeu puisse fonctionner normalement",
	title: "Programmes non installés"
};
const catalogue$g = {
	next_page: "Page suivante",
	previous_page: "Page précédente"
};
const translation$g = {
	home: home$g,
	sidebar: sidebar$g,
	header: header$g,
	bottom_panel: bottom_panel$g,
	game_details: game_details$g,
	activation: activation$g,
	downloads: downloads$g,
	settings: settings$g,
	notifications: notifications$f,
	system_tray: system_tray$f,
	game_card: game_card$f,
	binary_not_found_modal: binary_not_found_modal$f,
	catalogue: catalogue$g
};

const home$f = {
	featured: "Featured",
	trending: "Népszerű",
	surprise_me: "Lepj meg",
	no_results: "Nem található"
};
const sidebar$f = {
	catalogue: "Katalógus",
	downloads: "Letöltések",
	settings: "Beállítások",
	my_library: "Könyvtáram",
	downloading_metadata: "{{title}} (Metadata letöltése…)",
	paused: "{{title}} (Szünet)",
	downloading: "{{title}} ({{percentage}} - Letöltés…)",
	filter: "Könyvtár szűrése",
	home: "Főoldal"
};
const header$f = {
	search: "Keresés",
	home: "Főoldal",
	catalogue: "Katalógus",
	downloads: "Letöltések",
	search_results: "Keresési eredmények",
	settings: "Beállítások"
};
const bottom_panel$f = {
	no_downloads_in_progress: "Nincsenek folyamatban lévő letöltések",
	downloading_metadata: "{{title}} metaadatainak letöltése…",
	downloading: "{{title}} letöltése… ({{percentage}} kész) - Befejezés {{eta}} - {{speed}}"
};
const catalogue$f = {
	next_page: "Következő olda",
	previous_page: "Előző olda"
};
const game_details$f = {
	open_download_options: "Letöltési lehetőségek",
	download_options_zero: "Nincs letöltési lehetőség",
	download_options_one: "{{count}} letöltési lehetőség",
	download_options_other: "{{count}} letöltési lehetőség",
	updated_at: "Frissítve: {{updated_at}}",
	install: "Letöltés",
	resume: "Folytatás",
	pause: "Szüneteltetés",
	cancel: "Mégse",
	remove: "Eltávolítás",
	space_left_on_disk: "{{space}} szabad hely a lemezen",
	eta: "Befejezés {{eta}}",
	downloading_metadata: "Metaadatok letöltése…",
	filter: "Repackek szűrése",
	requirements: "Rendszerkövetelmények",
	minimum: "Minimális",
	recommended: "Ajánlott",
	release_date: "Megjelenés: {{date}}",
	publisher: "Kiadta: {{publisher}}",
	hours: "óra",
	minutes: "perc",
	amount_hours: "{{amount}} óra",
	amount_minutes: "{{amount}} perc",
	accuracy: "{{accuracy}}% pontosság",
	add_to_library: "Hozzáadás a könyvtárhoz",
	remove_from_library: "Eltávolítás a könyvtárból",
	no_downloads: "Nincs elérhető letöltés",
	play_time: "Játszva: {{amount}}",
	last_time_played: "Utoljára játszva {{period}}",
	not_played_yet: "{{title}} még nem játszottál",
	next_suggestion: "Következő javaslat",
	play: "Játék",
	deleting: "Telepítő törlése…",
	close: "Bezárás",
	playing_now: "Jelenleg játszva",
	change: "Változtatás",
	repacks_modal_description: "Choose the repack you want to download",
	select_folder_hint: "Ahhoz, hogy megváltoztasd a helyet, hozzákell férned a",
	download_now: "Töltsd le most"
};
const activation$f = {
	title: "Hydra Aktiválása",
	installation_id: "Telepítési ID:",
	enter_activation_code: "Add meg az aktiválási kódodat",
	message: "Ha nem tudod, hol kérdezd meg ezt, akkor nem is kellene, hogy legyen ilyened.",
	activate: "Aktiválás",
	loading: "Betöltés…"
};
const downloads$f = {
	resume: "Folytatás",
	pause: "Szüneteltetés",
	eta: "Befejezés {{eta}}",
	paused: "Szüneteltetve",
	verifying: "Ellenőrzés…",
	completed: "Befejezve",
	cancel: "Mégse",
	filter: "Letöltött játékok szűrése",
	remove: "Eltávolítás",
	downloading_metadata: "Metaadatok letöltése…",
	deleting: "Telepítő törlése…",
	"delete": "Telepítő eltávolítása",
	delete_modal_title: "Biztos vagy benne?",
	delete_modal_description: "Ez eltávolít minden telepítési fájlt a számítógépedről",
	install: "Telepítés"
};
const settings$f = {
	downloads_path: "Letöltések helye",
	change: "Frissítés",
	notifications: "Értesítések",
	enable_download_notifications: "Amikor egy letöltés befejeződik",
	enable_repack_list_notifications: "Amikor egy új repack hozzáadásra kerül"
};
const notifications$e = {
	download_complete: "Letöltés befejeződött",
	game_ready_to_install: "{{title}} telepítésre kész",
	repack_list_updated: "Repack lista frissítve",
	repack_count_one: "{{count}} repack hozzáadva",
	repack_count_other: "{{count}} repack hozzáadva"
};
const system_tray$e = {
	open: "Hydra megnyitása",
	quit: "Kilépés"
};
const game_card$e = {
	no_downloads: "Nincs elérhető letöltés"
};
const binary_not_found_modal$e = {
	title: "A programok nincsenek telepítve",
	description: "A Wine vagy a Lutris végrehajtható fájljai nem találhatók a rendszereden",
	instructions: "Ellenőrizd a megfelelő telepítési módot bármelyiküknek a Linux disztribúciódon, hogy a játék normálisan fusson"
};
const translation$f = {
	home: home$f,
	sidebar: sidebar$f,
	header: header$f,
	bottom_panel: bottom_panel$f,
	catalogue: catalogue$f,
	game_details: game_details$f,
	activation: activation$f,
	downloads: downloads$f,
	settings: settings$f,
	notifications: notifications$e,
	system_tray: system_tray$e,
	game_card: game_card$e,
	binary_not_found_modal: binary_not_found_modal$e
};

const home$e = {
	featured: "In primo piano",
	trending: "Di tendenza",
	surprise_me: "Sorprendimi",
	no_results: "Nessun risultato trovato"
};
const sidebar$e = {
	catalogue: "Catalogo",
	downloads: "Download",
	settings: "Impostazioni",
	my_library: "La mia libreria",
	downloading_metadata: "{{title}} (Scaricamento metadati…)",
	paused: "{{title}} (In pausa)",
	downloading: "{{title}} ({{percentage}} - Download…)",
	filter: "Filtra libreria",
	home: "Home"
};
const header$e = {
	search: "Cerca",
	home: "Home",
	catalogue: "Catalogo",
	downloads: "Download",
	search_results: "Risultati della ricerca",
	settings: "Impostazioni"
};
const bottom_panel$e = {
	no_downloads_in_progress: "Nessun download in corso",
	downloading_metadata: "Scaricamento metadati di {{title}}…",
	downloading: "Download di {{title}}… ({{percentage}} completato) - Conclusione {{eta}} - {{speed}}"
};
const catalogue$e = {
	next_page: "Pagina successiva",
	previous_page: "Pagina precedente"
};
const game_details$e = {
	open_download_options: "Apri opzioni di download",
	download_options_zero: "Nessuna opzione di download",
	download_options_one: "{{count}} opzione di download",
	download_options_other: "{{count}} opzioni di download",
	updated_at: "Aggiornato il {{updated_at}}",
	install: "Installa",
	resume: "Riprendi",
	pause: "Metti in pausa",
	cancel: "Annulla",
	remove: "Rimuovi",
	space_left_on_disk: "{{space}} rimasto sul disco",
	eta: "Conclusione {{eta}}",
	downloading_metadata: "Scaricamento metadati…",
	filter: "Filtra repack",
	requirements: "Requisiti di sistema",
	minimum: "Minimi",
	recommended: "Consigliati",
	release_date: "Rilasciato il {{date}}",
	publisher: "Pubblicato da {{publisher}}",
	hours: "ore",
	minutes: "minuti",
	amount_hours: "{{amount}} ore",
	amount_minutes: "{{amount}} minuti",
	accuracy: "{{accuracy}}% di accuratezza",
	add_to_library: "Aggiungi alla libreria",
	remove_from_library: "Rimuovi dalla libreria",
	no_downloads: "Nessun download disponibile",
	play_time: "Giocato per {{amount}}",
	last_time_played: "Ultimo gioco giocato {{period}}",
	not_played_yet: "Non hai ancora giocato a {{title}}",
	next_suggestion: "Prossimo suggerimento",
	play: "Gioca",
	deleting: "Eliminazione dell'installer…",
	close: "Chiudi",
	playing_now: "Stai giocando adesso",
	change: "Aggiorna",
	repacks_modal_description: "Scegli il repack che vuoi scaricare",
	select_folder_hint: "Per cambiare la cartella predefinita, accedi alle",
	download_now: "Scarica ora",
	no_shop_details: "Impossibile recuperare i dettagli del negozio.",
	download_options: "Opzioni di download",
	download_path: "Percorso di download",
	previous_screenshot: "Screenshot precedente",
	next_screenshot: "Screenshot successivo",
	screenshot: "Screenshot {{number}}",
	open_screenshot: "Apri screenshot {{number}}"
};
const activation$e = {
	title: "Attiva Hydra",
	installation_id: "ID installazione:",
	enter_activation_code: "Inserisci il tuo codice di attivazione",
	message: "Se non sai dove chiederlo, allora non dovresti averlo.",
	activate: "Attiva",
	loading: "Caricamento…"
};
const downloads$e = {
	resume: "Riprendi",
	pause: "Metti in pausa",
	eta: "Conclusione {{eta}}",
	paused: "In pausa",
	verifying: "Verifica…",
	completed: "Completato",
	cancel: "Annulla",
	filter: "Filtra giochi scaricati",
	remove: "Rimuovi",
	downloading_metadata: "Scaricamento metadati…",
	deleting: "Eliminazione dell'installer…",
	"delete": "Rimuovi installer",
	delete_modal_title: "Sei sicuro?",
	delete_modal_description: "Questo rimuoverà tutti i file di installazione dal tuo computer",
	install: "Installa"
};
const settings$e = {
	downloads_path: "Percorso dei download",
	change: "Aggiorna",
	notifications: "Notifiche",
	enable_download_notifications: "Quando un download è completo",
	enable_repack_list_notifications: "Quando viene aggiunto un nuovo repack",
	real_debrid_api_token_label: "Token API Real Debrid",
	quit_app_instead_hiding: "Esci da Hydra invece di nascondere nell'area di notifica",
	launch_with_system: "Apri Hydra all'avvio",
	general: "Generale",
	behavior: "Comportamento",
	enable_real_debrid: "Abilita Real Debrid",
	real_debrid_api_token_hint: "Puoi trovare la tua chiave API <0>here</0>",
	save_changes: "Salva modifiche"
};
const notifications$d = {
	download_complete: "Download completato",
	game_ready_to_install: "{{title}} è pronto per l'installazione",
	repack_list_updated: "Elenco repack aggiornato",
	repack_count_one: "{{count}} repack aggiunto",
	repack_count_other: "{{count}} repack aggiunti"
};
const system_tray$d = {
	open: "Apri Hydra",
	quit: "Esci"
};
const game_card$d = {
	no_downloads: "Nessun download disponibile"
};
const binary_not_found_modal$d = {
	title: "Programmi non installati",
	description: "Gli eseguibili di Wine o Lutris non sono stati trovati sul tuo sistema",
	instructions: "Verifica il modo corretto di installare uno di essi sulla tua distribuzione Linux in modo che il gioco possa funzionare normalmente"
};
const modal$e = {
	close: "Pulsante Chiudi"
};
const translation$e = {
	home: home$e,
	sidebar: sidebar$e,
	header: header$e,
	bottom_panel: bottom_panel$e,
	catalogue: catalogue$e,
	game_details: game_details$e,
	activation: activation$e,
	downloads: downloads$e,
	settings: settings$e,
	notifications: notifications$d,
	system_tray: system_tray$d,
	game_card: game_card$d,
	binary_not_found_modal: binary_not_found_modal$d,
	modal: modal$e
};

const home$d = {
	featured: "Wyróżnione",
	trending: "Trendujące",
	surprise_me: "Zaskocz mnie",
	no_results: "Nie znaleziono wyników"
};
const sidebar$d = {
	catalogue: "Katalog",
	downloads: "Pobrane",
	settings: "Ustawienia",
	my_library: "Moja biblioteka",
	downloading_metadata: "{{title}} (Pobieranie metadata…)",
	paused: "{{title}} (Zatrzymano)",
	downloading: "{{title}} ({{percentage}} - Pobieranie…)",
	filter: "Filtruj biblioteke",
	home: "Główna"
};
const header$d = {
	search: "Szukaj",
	home: "Główna",
	catalogue: "Katalog",
	downloads: "Pobrane",
	search_results: "Wyniki wyszukiwania",
	settings: "Ustawienia"
};
const bottom_panel$d = {
	no_downloads_in_progress: "Brak pobierań w toku",
	downloading_metadata: "Pobieranie {{title}} metadata…",
	downloading: "Pobieranie {{title}}… (ukończone w {{percentage}}) - Podsumowanie {{eta}} - {{speed}}"
};
const catalogue$d = {
	next_page: "Następna strona",
	previous_page: "Poprzednia strona"
};
const game_details$d = {
	open_download_options: "Otwórz opcje pobierania",
	download_options_zero: "Brak opcji pobierania",
	download_options_one: "{{count}} opcja pobierania",
	download_options_other: "{{count}} opcji pobierania",
	updated_at: "Zaktualizowano {{updated_at}}",
	install: "Instaluj",
	resume: "Wznów",
	pause: "Zatrzymaj",
	cancel: "Anuluj",
	remove: "Usuń",
	space_left_on_disk: "{{space}} wolnego na dysku",
	eta: "Podsumowanie {{eta}}",
	downloading_metadata: "Pobieranie metadata…",
	filter: "Filtruj repacki",
	requirements: "Wymagania systemowe",
	minimum: "Minimalne",
	recommended: "Zalecane",
	release_date: "Wydano w {{date}}",
	publisher: "Opublikowany przez {{publisher}}",
	hours: "godzin",
	minutes: "minut",
	amount_hours: "{{amount}} godzin",
	amount_minutes: "{{amount}} minut",
	accuracy: "{{accuracy}}% dokładność",
	add_to_library: "Dodaj do biblioteki",
	remove_from_library: "Usuń z biblioteki",
	no_downloads: "Brak dostępnych plików do pobrania",
	play_time: "Grano przez {{amount}}",
	last_time_played: "Ostatnio grano {{period}}",
	not_played_yet: "Nie grano {{title}}",
	next_suggestion: "Następna sugestia",
	play: "Graj",
	deleting: "Usuwanie instalatora…",
	close: "Zamknij",
	playing_now: "Granie teraz",
	change: "Zmień",
	repacks_modal_description: "Wybierz repack, który chcesz pobrać",
	select_folder_hint: "Aby zmienić domyślny folder, przejdź do",
	download_now: "Pobierz teraz",
	no_shop_details: "Nie udało się pobrać danych sklepu.",
	download_options: "Opcje pobierania",
	download_path: "Ścieżka pobierania",
	previous_screenshot: "Poprzedni zrzut ekranu",
	next_screenshot: "Następny zrzut ekranu",
	screenshot: "Zrzut ekranu {{number}}",
	open_screenshot: "Otwórz zrzut ekranu {{number}}"
};
const activation$d = {
	title: "Aktywuj Hydra",
	installation_id: "Identyfikator instalacji:",
	enter_activation_code: "Enter your activation code",
	message: "Jeśli nie wiesz, gdzie o to poprosić, to nie powinieneś/aś tego mieć.",
	activate: "Aktywuj",
	loading: "Ładowanie…"
};
const downloads$d = {
	resume: "Wznów",
	pause: "Zatrzymaj",
	eta: "Podsumowanie {{eta}}",
	paused: "Zatrzymano",
	verifying: "Weryfikowanie…",
	completed: "Zakończono",
	cancel: "Anuluj",
	filter: "Filtruj pobrane gry",
	remove: "Usuń",
	downloading_metadata: "Pobieranie metadata…",
	deleting: "Usuwanie instalatora…",
	"delete": "Usuń instalator",
	delete_modal_title: "Czy na pewno?",
	delete_modal_description: "Spowoduje to usunięcie wszystkich plików instalacyjnych z komputera",
	install: "Instaluj"
};
const settings$d = {
	downloads_path: "Ścieżka pobierania",
	change: "Aktualizuj",
	notifications: "Powiadomienia",
	enable_download_notifications: "Gdy pobieranie zostanie zakończone",
	enable_repack_list_notifications: "Gdy dodawany jest nowy repack",
	real_debrid_api_token_label: "Real-Debrid API token",
	quit_app_instead_hiding: "Zamknij Hydr zamiast minimalizować do zasobnika",
	launch_with_system: "Uruchom Hydra przy starcie systemu",
	general: "Ogólne",
	behavior: "Zachowania",
	language: "Język",
	enable_real_debrid: "Włącz Real-Debrid",
	real_debrid_api_token_hint: "Możesz uzyskać swój klucz API <0>tutaj</0>",
	save_changes: "Zapisz zmiany"
};
const notifications$c = {
	download_complete: "Pobieranie zakończone",
	game_ready_to_install: "{{title}} jest gotowe do zainstalowania",
	repack_list_updated: "Lista repacków zaktualizowana",
	repack_count_one: "{{count}} repack dodany",
	repack_count_other: "{{count}} repacki dodane"
};
const system_tray$c = {
	open: "Otwórz Hydra",
	quit: "Wyjdź"
};
const game_card$c = {
	no_downloads: "Brak dostępnych plików do pobrania"
};
const binary_not_found_modal$c = {
	title: "Programy nie są zainstalowane",
	description: "Pliki wykonywalne Wine lub Lutris nie zostały znalezione na twoim systemie",
	instructions: "Sprawdź prawidłowy sposób instalacji dowolnego z nich w swojej dystrybucji Linuksa, aby gra działała normalnie"
};
const modal$d = {
	close: "Zamknij"
};
const translation$d = {
	home: home$d,
	sidebar: sidebar$d,
	header: header$d,
	bottom_panel: bottom_panel$d,
	catalogue: catalogue$d,
	game_details: game_details$d,
	activation: activation$d,
	downloads: downloads$d,
	settings: settings$d,
	notifications: notifications$c,
	system_tray: system_tray$c,
	game_card: game_card$c,
	binary_not_found_modal: binary_not_found_modal$c,
	modal: modal$d
};

const app$3 = {
	successfully_signed_in: "Успешный вход"
};
const home$c = {
	featured: "Рекомендованное",
	trending: "В тренде",
	surprise_me: "Удиви меня",
	no_results: "Ничего не найдено"
};
const sidebar$c = {
	catalogue: "Каталог",
	downloads: "Загрузки",
	settings: "Настройки",
	my_library: "Библиотека",
	downloading_metadata: "{{title}} (Загрузка метаданных…)",
	paused: "{{title}} (Приостановлено)",
	downloading: "{{title}} ({{percentage}} - Загрузка…)",
	filter: "Фильтр библиотеки",
	home: "Главная",
	queued: "{{title}} (В очереди)",
	game_has_no_executable: "Файл запуска игры не выбран",
	sign_in: "Войти"
};
const header$c = {
	search: "Поиск",
	home: "Главная",
	catalogue: "Каталог",
	downloads: "Загрузки",
	search_results: "Результаты поиска",
	settings: "Настройки",
	version_available_install: "Доступна версия {{version}}. Нажмите здесь для перезапуска и установки.",
	version_available_download: "Доступна версия {{version}}. Нажмите здесь для загрузки."
};
const bottom_panel$c = {
	no_downloads_in_progress: "Нет активных загрузок",
	downloading_metadata: "Загрузка метаданных {{title}}…",
	downloading: "Загрузка {{title}}… ({{percentage}} завершено) - Окончание {{eta}} - {{speed}}",
	calculating_eta: "Загрузка {{title}}… ({{percentage}} завершено) - Подсчёт оставшегося времени…"
};
const catalogue$c = {
	next_page: "Следующая страница",
	previous_page: "Предыдущая страница"
};
const game_details$c = {
	open_download_options: "Открыть варианты загрузки",
	download_options_zero: "Нет вариантов загрузки",
	download_options_one: "{{count}} вариант загрузки",
	download_options_other: "{{count}} вариантов загрузки",
	updated_at: "Обновлено {{updated_at}}",
	install: "Установить",
	resume: "Возобновить",
	pause: "Приостановить",
	cancel: "Отменить",
	remove: "Удалить",
	space_left_on_disk: "{{space}} свободно на диске",
	eta: "Окончание {{eta}}",
	calculating_eta: "Подсчёт оставшегося времени…",
	downloading_metadata: "Загрузка метаданных…",
	filter: "Фильтр репаков",
	requirements: "Системные требования",
	minimum: "Минимальные",
	recommended: "Рекомендуемые",
	paused: "Приостановлено",
	release_date: "Выпущено {{date}}",
	publisher: "Издатель {{publisher}}",
	hours: "часов",
	minutes: "минут",
	amount_hours: "{{amount}} часов",
	amount_minutes: "{{amount}} минут",
	accuracy: "точность {{accuracy}}%",
	add_to_library: "Добавить в библиотеку",
	remove_from_library: "Удалить из библиотеки",
	no_downloads: "Нет доступных загрузок",
	play_time: "Сыграно {{amount}}",
	last_time_played: "Последний запуск {{period}}",
	not_played_yet: "Вы ещё не играли в {{title}}",
	next_suggestion: "Следующее предложение",
	play: "Играть",
	deleting: "Удаление установщика…",
	close: "Закрыть",
	playing_now: "Запущено",
	change: "Изменить",
	repacks_modal_description: "Выберите репак для загрузки",
	select_folder_hint: "Чтобы изменить папку загрузок по умолчанию, откройте <0>Настройки</0>",
	download_now: "Загрузить сейчас",
	no_shop_details: "Не удалось получить описание",
	download_options: "Вариантов загрузки",
	download_path: "Путь для загрузок",
	previous_screenshot: "Предыдущий скриншот",
	next_screenshot: "Следующий скриншот",
	screenshot: "Скриншот {{number}}",
	open_screenshot: "Открыть скриншот {{number}}",
	download_settings: "Параметры загрузки",
	downloader: "Загрузчик",
	select_executable: "Выбрать",
	no_executable_selected: "Файл не выбран",
	open_folder: "Открыть папку",
	open_download_location: "Просмотреть папку загрузок",
	create_shortcut: "Создать ярлык на рабочем столе",
	remove_files: "Удалить файлы",
	remove_from_library_title: "Вы уверены?",
	remove_from_library_description: "{{game}} будет удалена из вашей библиотеки.",
	options: "Настройки",
	executable_section_title: "Файл",
	executable_section_description: "Путь к файлу, который будет запущен при нажатии на \"Play\"",
	downloads_secion_title: "Загрузки",
	downloads_section_description: "Проверить наличие обновлений или других версий игры",
	danger_zone_section_title: "Опасная зона",
	danger_zone_section_description: "Удалить эту игру из вашей библиотеки или файлы скачанные Hydra",
	download_in_progress: "Идёт загрузка",
	download_paused: "Загрузка приостановлена",
	last_downloaded_option: "Последний вариант загрузки",
	create_shortcut_success: "Ярлык создан",
	create_shortcut_error: "Не удалось создать ярлык"
};
const activation$c = {
	title: "Активировать Hydra",
	installation_id: "ID установки:",
	enter_activation_code: "Введите ваш активационный код",
	message: "Если вы не знаете, где его запросить, у вас его не должно быть.",
	activate: "Активировать",
	loading: "Загрузка…"
};
const downloads$c = {
	resume: "Возобновить",
	pause: "Приостановить",
	eta: "Окончание {{eta}}",
	paused: "Приостановлено",
	verifying: "Проверка…",
	completed: "Завершено",
	removed: "Не скачано",
	cancel: "Отмена",
	filter: "Фильтр загруженных игр",
	remove: "Удалить",
	downloading_metadata: "Загрузка метаданных…",
	deleting: "Удаление установщика…",
	"delete": "Удалить установщик",
	delete_modal_title: "Вы уверены?",
	delete_modal_description: "Это удалит все установщики с вашего компьютера",
	install: "Установить",
	download_in_progress: "В процессе",
	queued_downloads: "Загрузки в очереди",
	downloads_completed: "Завершено",
	queued: "В очереди",
	no_downloads_title: "Здесь так пусто...",
	no_downloads_description: "Вы ещё ничего не скачали через Hydra, но никогда не поздно начать."
};
const settings$c = {
	downloads_path: "Путь загрузок",
	change: "Изменить",
	notifications: "Уведомления",
	enable_download_notifications: "По завершении загрузки",
	enable_repack_list_notifications: "При добавлении нового репака",
	real_debrid_api_token_label: "Real-Debrid API-токен",
	quit_app_instead_hiding: "Закрывать приложение вместо сворачивания в трей",
	launch_with_system: "Запускать Hydra вместе с системой",
	general: "Основные",
	behavior: "Поведение",
	download_sources: "Источники загрузки",
	language: "Язык",
	real_debrid_api_token: "API Ключ",
	enable_real_debrid: "Включить Real-Debrid",
	real_debrid_description: "Real-Debrid - это неограниченный загрузчик, который позволяет быстро скачивать файлы, размещенные в Интернете, или мгновенно передавать их в плеер через частную сеть, позволяющую обходить любые блокировки.",
	real_debrid_invalid_token: "Неверный API ключ",
	real_debrid_api_token_hint: "API ключ можно получить <0>здесь</0>",
	real_debrid_free_account_error: "Аккаунт \"{{username}}\" - не имеет подписки. Пожалуйста, оформите подписку на Real-Debrid",
	real_debrid_linked_message: "Привязан аккаунт \"{{username}}\"",
	save_changes: "Сохранить изменения",
	changes_saved: "Изменения успешно сохранены",
	download_sources_description: "Hydra будет получать ссылки на загрузки из этих источников. URL должна содержать прямую ссылку на .json-файл с ссылками для загрузок.",
	validate_download_source: "Проверить",
	remove_download_source: "Удалить",
	add_download_source: "Добавить источник",
	download_count_zero: "В списке нет загрузок",
	download_count_one: "{{countFormatted}} загрузка в списке",
	download_count_other: "{{countFormatted}} загрузок в списке",
	download_options_zero: "Нет доступных загрузок",
	download_options_one: "{{countFormatted}} вариант загрузки доступен",
	download_options_other: "{{countFormatted}} вариантов загрузки доступно",
	download_source_url: "Ссылка на источник",
	add_download_source_description: "Вставьте ссылку на .json-файл",
	download_source_up_to_date: "Обновлён",
	download_source_errored: "Ошибка",
	sync_download_sources: "Синхронизировать источники",
	removed_download_source: "Источник загрузок удален",
	added_download_source: "Источник загрузок добавлен",
	download_sources_synced: "Все источники загрузок синхронизированы",
	insert_valid_json_url: "Вставьте действительный URL JSON-файла",
	found_download_option_zero: "Не найдено вариантов загрузки",
	found_download_option_one: "Найден {{countFormatted}} вариант загрузки",
	found_download_option_other: "Найдено {{countFormatted}} вариантов загрузки",
	"import": "Импортировать"
};
const notifications$b = {
	download_complete: "Загрузка завершена",
	game_ready_to_install: "{{title}} готова к установке",
	repack_list_updated: "Список репаков обновлен",
	repack_count_one: "{{count}} репак добавлен",
	repack_count_other: "{{count}} репаков добавлено",
	new_update_available: "Доступна версия {{version}}"
};
const system_tray$b = {
	open: "Открыть Hydra",
	quit: "Выйти"
};
const game_card$b = {
	no_downloads: "Нет доступных загрузок"
};
const binary_not_found_modal$b = {
	title: "Программы не установлены",
	description: "Wine или Lutris не найдены",
	instructions: "Узнайте правильный способ установить любой из них на ваш дистрибутив Linux, чтобы игра могла нормально работать"
};
const modal$c = {
	close: "Закрыть"
};
const forms$3 = {
	toggle_password_visibility: "Показывать пароль"
};
const user_profile$3 = {
	amount_hours: "{{amount}} часов",
	amount_minutes: "{{amount}} минут",
	last_time_played: "Последняя игра {{period}}",
	activity: "Недавняя активность",
	library: "Библиотека",
	total_play_time: "Всего сыграно: {{amount}}",
	no_recent_activity_title: "Хммм... Тут ничего нет",
	no_recent_activity_description: "Вы давно ни во что не играли. Пора это изменить!",
	display_name: "Отображаемое имя",
	saving: "Сохранение",
	save: "Сохранить",
	edit_profile: "Редактировать Профиль",
	saved_successfully: "Успешно сохранено",
	try_again: "Пожалуйста, попробуйте ещё раз",
	sign_out_modal_title: "Вы уверены?",
	cancel: "Отменить",
	successfully_signed_out: "Успешный выход из аккаунта",
	sign_out: "Выйти",
	playing_for: "Сыграно {{amount}}",
	sign_out_modal_text: "Ваша библиотека связана с текущей учетной записью. При выходе из системы ваша библиотека станет недоступна, и прогресс не будет сохранен. Выйти?"
};
const translation$c = {
	app: app$3,
	home: home$c,
	sidebar: sidebar$c,
	header: header$c,
	bottom_panel: bottom_panel$c,
	catalogue: catalogue$c,
	game_details: game_details$c,
	activation: activation$c,
	downloads: downloads$c,
	settings: settings$c,
	notifications: notifications$b,
	system_tray: system_tray$b,
	game_card: game_card$b,
	binary_not_found_modal: binary_not_found_modal$b,
	modal: modal$c,
	forms: forms$3,
	user_profile: user_profile$3
};

const home$b = {
	featured: "Öne çıkan",
	trending: "Popüler",
	surprise_me: "Şaşırt beni",
	no_results: "Sonuç bulunamadı"
};
const sidebar$b = {
	catalogue: "Katalog",
	downloads: "İndirmeler",
	settings: "Ayarlar",
	my_library: "Kütüphane",
	downloading_metadata: "{{title}} (Metadata indiriliyor…)",
	paused: "{{title}} (Duraklatıldı)",
	downloading: "{{title}} ({{percentage}} - İndiriliyor…)",
	filter: "Kütüphaneyi filtrele",
	home: "Ana menü"
};
const header$b = {
	search: "Ara",
	home: "Ana menü",
	catalogue: "Katalog",
	downloads: "İndirmeler",
	search_results: "Arama sonuçları",
	settings: "Ayarlar"
};
const bottom_panel$b = {
	no_downloads_in_progress: "İndirilen bir şey yok",
	downloading_metadata: "{{title}} metadatası indiriliyor…",
	downloading: "{{title}} indiriliyor… ({{percentage}} tamamlandı) - Bitiş {{eta}} - {{speed}}"
};
const catalogue$b = {
	next_page: "Sonraki sayfa",
	previous_page: "Önceki sayfa"
};
const game_details$b = {
	open_download_options: "İndirme seçeneklerini aç",
	download_options_zero: "İndirme seçeneği yok",
	download_options_one: "{{count}} indirme seçeneği",
	download_options_other: "{{count}} indirme seçeneği",
	updated_at: "{{updated_at}} güncellendi",
	install: "İndir",
	resume: "Devam et",
	pause: "Duraklat",
	cancel: "İptal et",
	remove: "Sil",
	space_left_on_disk: "Diskte {{space}} yer kaldı",
	eta: "Bitiş {{eta}}",
	downloading_metadata: "Metadata indiriliyor…",
	filter: "Repackleri filtrele",
	requirements: "Sistem gereksinimleri",
	minimum: "Minimum",
	recommended: "Önerilen",
	release_date: "{{date}} tarihinde çıktı",
	publisher: "{{publisher}} tarihinde yayınlandı",
	hours: "saatler",
	minutes: "dakikalar",
	amount_hours: "{{amount}} saat",
	amount_minutes: "{{amount}} dakika",
	accuracy: "%{{accuracy}} doğruluk",
	add_to_library: "Kütüphaneye ekle",
	remove_from_library: "Kütüphaneden kaldır",
	no_downloads: "İndirme yok",
	play_time: "{{amount}} oynandı",
	last_time_played: "Son oynanan {{period}}",
	not_played_yet: "Bu {{title}} hiç oynanmadı",
	next_suggestion: "Sıradaki öneri",
	play: "Oyna",
	deleting: "Installer siliniyor…",
	close: "Kapat",
	playing_now: "Şimdi oynanıyor",
	change: "Değiştir",
	repacks_modal_description: "İndirmek istediğiiniz repacki seçin",
	select_folder_hint: "Varsayılan klasörü değiştirmek için ulaşmanız gereken ayar",
	download_now: "Şimdi"
};
const activation$b = {
	title: "Hydra'yı aktif et",
	installation_id: "Kurulum ID'si:",
	enter_activation_code: "Aktifleştirme kodunuzu girin",
	message: "Bunu nerede soracağınızı bilmiyorsanız, buna sahip olmamanız gerekiyor.",
	activate: "Aktif et",
	loading: "Yükleniyor…"
};
const downloads$b = {
	resume: "Devam et",
	pause: "Duraklat",
	eta: "Bitiş {{eta}}",
	paused: "Duraklatıldı",
	verifying: "Doğrulanıyor…",
	completed: "Tamamlandı",
	cancel: "İptal et",
	filter: "Yüklü oyunları filtrele",
	remove: "Kaldır",
	downloading_metadata: "Metadata indiriliyor…",
	deleting: "Installer siliniyor…",
	"delete": "Installer'ı sil",
	delete_modal_title: "Emin misiniz?",
	delete_modal_description: "Bu bilgisayarınızdan tüm kurulum dosyalarını silecek",
	install: "Kur"
};
const settings$b = {
	downloads_path: "İndirme yolu",
	change: "Güncelle",
	notifications: "Bildirimler",
	enable_download_notifications: "Bir indirme bittiğinde",
	enable_repack_list_notifications: "Yeni bir repack eklendiğinde"
};
const notifications$a = {
	download_complete: "İndirme tamamlandı",
	game_ready_to_install: "{{title}} kuruluma hazır",
	repack_list_updated: "Repack listesi güncellendi",
	repack_count_one: "{{count}} yeni repack eklendi",
	repack_count_other: "{{count}} yeni repack eklendi"
};
const system_tray$a = {
	open: "Hydra'yı aç",
	quit: "Çık"
};
const game_card$a = {
	no_downloads: "İndirme mevcut değil"
};
const binary_not_found_modal$a = {
	title: "Programlar yüklü değil",
	description: "Sisteminizde Wine veya Lutris çalıştırılabiliri bulunamadı",
	instructions: "Oyunları düzgün şekilde çalıştırmak için Linux distronuza bunlardan birini nasıl yükleyebileceğinize bakın"
};
const modal$b = {
	close: "Kapat tuşu"
};
const translation$b = {
	home: home$b,
	sidebar: sidebar$b,
	header: header$b,
	bottom_panel: bottom_panel$b,
	catalogue: catalogue$b,
	game_details: game_details$b,
	activation: activation$b,
	downloads: downloads$b,
	settings: settings$b,
	notifications: notifications$a,
	system_tray: system_tray$a,
	game_card: game_card$a,
	binary_not_found_modal: binary_not_found_modal$a,
	modal: modal$b
};

const home$a = {
	featured: "Рэкамэндаванае",
	trending: "Актуальнае",
	surprise_me: "Здзіві мяне",
	no_results: "Няма вынікаў"
};
const sidebar$a = {
	catalogue: "Каталог",
	downloads: "Сцягванні",
	settings: "Налады",
	my_library: "Мая бібліятэка",
	downloading_metadata: "{{title}} (Сцягванне мэтаданых…)",
	paused: "{{title}} (Спынена)",
	downloading: "{{title}} ({{percentage}} - Сцягванне…)",
	filter: "Фільтар бібліятэкі",
	home: "Галоўная"
};
const header$a = {
	search: "Пошук",
	home: "Галоўная",
	catalogue: "Каталог",
	downloads: "Сцягванні",
	search_results: "Вынікі пошуку",
	settings: "Налады"
};
const bottom_panel$a = {
	no_downloads_in_progress: "Няма актыўных сцягванняў",
	downloading_metadata: "Сцягванне мэтаданых {{title}}…",
	downloading: "Сцягванне {{title}}… ({{percentage}} скончана) - Канчатак {{eta}} - {{speed}}"
};
const catalogue$a = {
	next_page: "Наступная старонка",
	previous_page: "Папярэдняя старонка"
};
const game_details$a = {
	open_download_options: "Адкрыць варыянты сцягвання",
	download_options_zero: "Няма варыянтаў сцягвання",
	download_options_one: "{{count}} варыянт сцягвання",
	download_options_other: "{{count}} варыянтаў сцягвання",
	updated_at: "Абноўлена {{updated_at}}",
	install: "Усталяваць",
	resume: "Працягнуць",
	pause: "Спыніць",
	cancel: "Скасаваць",
	remove: "Выдаліць",
	space_left_on_disk: "{{space}} засталося на дыску",
	eta: "Канчатак {{eta}}",
	downloading_metadata: "Сцягванне мэтаданых…",
	filter: "Фільтар рэпакаў",
	requirements: "Сістэмныя патрэбаванни",
	minimum: "Мінімальныя",
	recommended: "Рэкамендуемыя",
	release_date: "Выпушчана {{date}}",
	publisher: "Выдана {{publisher}}",
	hours: "гадзін",
	minutes: "хвілін",
	amount_hours: "{{amount}} гадзін",
	amount_minutes: "{{amount}} хвілін",
	accuracy: "{{accuracy}}% дакладнасць",
	add_to_library: "Дадаць да бібліятэкі",
	remove_from_library: "Выдаліць з бібліятэкі",
	no_downloads: "Няма даступных сцягванняў",
	play_time: "Гулялі {{amount}}",
	last_time_played: "Апошні раз гулялі {{period}}",
	not_played_yet: "Вы яшчэ не гулялі ў {{title}}",
	next_suggestion: "Наступная прапанова",
	play: "Гуляць",
	deleting: "Выдаленне ўсталёўшчыка…",
	close: "Закрыць",
	playing_now: "Зараз гуляе",
	change: "Змяніць",
	repacks_modal_description: "Абярыце рэпак, які хочаце сцягнуць",
	select_folder_hint: "Каб змяніць папку па змоўчанні, адкрыйце",
	download_now: "Сцягнуць зараз"
};
const activation$a = {
	title: "Актываваць Hydra",
	installation_id: "ID усталёўкі:",
	enter_activation_code: "Увядзіце ваш код актывацыі",
	message: "Калі вы ня ведаеце, дзе яго атрымаць, то не мусіць гэтага рабіць.",
	activate: "Актываваць",
	loading: "Загрузка…"
};
const downloads$a = {
	resume: "Працягнуць",
	pause: "Спыніць",
	eta: "Канчатак {{eta}}",
	paused: "Спынена",
	verifying: "Праверка…",
	completed: "Скончана",
	cancel: "Скасаваць",
	filter: "Фільтар сцягнутых гульняў",
	remove: "Выдаліць",
	downloading_metadata: "Сцягванне мэтаданых…",
	deleting: "Выдаленне ўсталёўшчыка…",
	"delete": "Выдаліць усталёўшчык",
	delete_modal_title: "Вы ўпэўнены?",
	delete_modal_description: "Гэта выдаліць усе файлы ўсталёвак з вашага кампутара",
	install: "Усталяваць"
};
const settings$a = {
	downloads_path: "Шлях сцягвання",
	change: "Змяніць шлях",
	notifications: "Апавяшчэнні",
	enable_download_notifications: "Па сканчэнні сцягванні",
	enable_repack_list_notifications: "Пры даданні новага рэпака",
	behavior: "Паводзіны",
	quit_app_instead_hiding: "Закрываць праграму замест таго, каб хаваць яе ў трэй",
	launch_with_system: "Запускаць праграму пры запуску сыстэмы"
};
const notifications$9 = {
	download_complete: "Сцягванне скончана",
	game_ready_to_install: "{{title}} гатова да ўсталёўкі",
	repack_list_updated: "Спіс рэпакаў абноўлены",
	repack_count_one: "{{count}} рэпак дададзены",
	repack_count_other: "{{count}} рэпакаў дададзена"
};
const system_tray$9 = {
	open: "Адкрыць Hydra",
	quit: "Выйсьці"
};
const game_card$9 = {
	no_downloads: "Няма даступных сцягванняў"
};
const binary_not_found_modal$9 = {
	title: "Праграмы не ўсталяваныя",
	description: "Выканальныя файлы Wine ці Lutris ня знойдзеныя ў вашай сістэме",
	instructions: "Даведайцеся, як правільна ўсталяваць любы з іх на вашым дыстрыбутыве Linux, каб гульня магла працаваць нармальна"
};
const modal$a = {
	close: "Кнопка закрыцця"
};
const translation$a = {
	home: home$a,
	sidebar: sidebar$a,
	header: header$a,
	bottom_panel: bottom_panel$a,
	catalogue: catalogue$a,
	game_details: game_details$a,
	activation: activation$a,
	downloads: downloads$a,
	settings: settings$a,
	notifications: notifications$9,
	system_tray: system_tray$9,
	game_card: game_card$9,
	binary_not_found_modal: binary_not_found_modal$9,
	modal: modal$a
};

const app$2 = {
	successfully_signed_in: "Успішний вхід в систему"
};
const home$9 = {
	featured: "Рекомендоване",
	trending: "У тренді",
	surprise_me: "Здивуй мене",
	no_results: "Результатів не знайдено"
};
const sidebar$9 = {
	catalogue: "Каталог",
	downloads: "Завантаження",
	settings: "Налаштування",
	my_library: "Бібліотека",
	downloading_metadata: "{{title}} (Завантаження метаданих…)",
	paused: "{{title}} (Призупинено)",
	downloading: "{{title}} ({{percentage}} - Завантаження…)",
	filter: "Фільтр бібліотеки",
	home: "Головна",
	game_has_no_executable: "Не було вибрано файл для запуску гри",
	queued: "{{title}} в черзі",
	sign_in: "Увійти"
};
const header$9 = {
	search: "Пошук",
	home: "Головна",
	catalogue: "Каталог",
	downloads: "Завантаження",
	search_results: "Результати пошуку",
	settings: "Налаштування",
	version_available_download: "Доступна версія {{version}}. Натисніть тут, щоб перезапустити та встановити.",
	version_available_install: "Доступна версія {{version}}. Натисніть тут для завантаження."
};
const bottom_panel$9 = {
	no_downloads_in_progress: "Немає активних завантажень",
	downloading_metadata: "Завантаження метаданих {{title}}…",
	downloading: "Завантаження {{title}}… ({{percentage}} завершено) - Закінчення {{eta}} - {{speed}}",
	calculating_eta: "Завантаження {{title}}… ({{percentage}} завершено) - Обчислення залишкового часу…"
};
const catalogue$9 = {
	next_page: "Наступна сторінка",
	previous_page: "Попередня сторінка"
};
const game_details$9 = {
	open_download_options: "Відкрити варіанти завантаження",
	download_options_zero: "Немає варіантів завантаження",
	download_options_one: "{{count}} варіант завантаження",
	download_options_other: "{{count}} варіантів завантаження",
	updated_at: "Оновлено {{updated_at}}",
	install: "Встановити",
	resume: "Відновити",
	pause: "Призупинити",
	cancel: "Скасувати",
	remove: "Видалити",
	space_left_on_disk: "{{space}} вільно на диску",
	eta: "Закінчення {{eta}}",
	downloading_metadata: "Завантаження метаданих…",
	filter: "Фільтр репаків",
	requirements: "Системні вимоги",
	minimum: "Мінімальні",
	recommended: "Рекомендовані",
	release_date: "Випущено {{date}}",
	publisher: "Видавець {{publisher}}",
	hours: "годин",
	minutes: "хвилин",
	amount_hours: "{{amount}} годин",
	amount_minutes: "{{amount}} хвилин",
	accuracy: "{{accuracy}}% точність",
	add_to_library: "Додати до бібліотеки",
	remove_from_library: "Видалити з бібліотеки",
	no_downloads: "Немає доступних завантажень",
	play_time: "Час гри: {{amount}}",
	last_time_played: "Востаннє зіграно: {{period}}",
	not_played_yet: "Ви ще не грали в {{title}}",
	next_suggestion: "Наступна пропозиція",
	play: "Грати",
	deleting: "Видалення інсталятора…",
	close: "Закрити",
	playing_now: "Поточна гра",
	change: "Змінити",
	repacks_modal_description: "Виберіть репак, який хочете завантажити",
	select_folder_hint: "Щоб змінити теку за замовчуванням, відкрийте",
	download_now: "Завантажити зараз",
	calculating_eta: "Обчислення залишкового часу…",
	create_shortcut: "Створити ярлик на робочому столі",
	danger_zone_section_description: "Видалити цю гру з вашої бібліотеки або файли скачані Hydra",
	danger_zone_section_title: "Небезпечна зона",
	download_in_progress: "Триває завантаження.",
	download_options: "Варіантів завантаження",
	download_path: "Тека для завантажень",
	download_paused: "Завантаження призупинено",
	download_settings: "Налаштування завантаження",
	downloader: "Завантажувач",
	downloads_secion_title: "Завантаження",
	downloads_section_description: "Перевірити наявність оновлень або інших версій гри",
	executable_section_description: "Шлях до файлу, який буде запущений при натисканні на кнопку \"Play\"",
	executable_section_title: "Файл",
	last_downloaded_option: "Останній варіант завантаження",
	next_screenshot: "Наступний скрішнот",
	no_executable_selected: "Файл не вибрано",
	no_shop_details: "Не вдалося отримати опис",
	open_download_location: "Переглянути папку завантажень",
	open_folder: "Відкрити папку",
	open_screenshot: "Відкрити скріншот",
	options: "Налаштування",
	paused: "Призупинено",
	previous_screenshot: "Попередній скріншот",
	remove_files: "Видалити файли",
	remove_from_library_description: "{{game}} буде видалено з вашої бібліотеки",
	remove_from_library_title: "Ви впевнені?",
	screenshot: "Скріншот",
	select_executable: "Обрати"
};
const activation$9 = {
	title: "Активувати Hydra",
	installation_id: "ID установки:",
	enter_activation_code: "Введіть ваш активаційний код",
	message: "Якщо ви не знаєте, де його запросити, то не повинні мати його.",
	activate: "Активувати",
	loading: "Завантаження…"
};
const downloads$9 = {
	resume: "Продовжити",
	pause: "Призупинити",
	eta: "Закінчення {{eta}}",
	paused: "Призупинено",
	verifying: "Перевірка…",
	completed: "Завершено",
	cancel: "Скасувати",
	filter: "Фільтр завантажених ігор",
	remove: "Видалити",
	downloading_metadata: "Завантаження метаданих…",
	deleting: "Видалення інсталятора…",
	"delete": "Видалити інсталятор",
	delete_modal_title: "Ви впевнені?",
	delete_modal_description: "Це видалить усі інсталяційні файли з вашого комп'ютера",
	install: "Встановити",
	download_in_progress: "В процесі",
	downloads_completed: "Завершено",
	no_downloads_description: "Ви ще нічого не завантажили через Hydra, але ніколи не пізно почати.",
	no_downloads_title: "Тут так пусто...",
	queued: "В черзі",
	queued_downloads: "Завантаження в черзі",
	removed: "Не завантажено"
};
const settings$9 = {
	downloads_path: "Тека завантажень",
	change: "Змінити",
	notifications: "Повідомлення",
	enable_download_notifications: "Після завершення завантаження",
	enable_repack_list_notifications: "Коли додається новий репак",
	behavior: "Поведінка",
	quit_app_instead_hiding: "Закривати Hydra замість того, щоб згортати її в трей",
	launch_with_system: "Запускати Hydra із запуском комп'ютера",
	add_download_source: "Добавити джерело",
	add_download_source_description: "Введіть посилання на .json-файл",
	added_download_source: "Джерело для завантаження було додано",
	changes_saved: "Зміни успішно збережено",
	download_count_one: "{{countFormatted}} завантаження в списку",
	download_count_other: "{{countFormatted}} завантажень в списку",
	download_count_zero: "В списку немає завантажень",
	download_options_one: "{{countFormatted}} доступний варіант завантаження",
	download_options_other: "{{countFormatted}} доступних варіантів завантаження",
	download_options_zero: "Немає доступних завантажень",
	download_source_errored: "Помилка",
	download_source_up_to_date: "Оновлено",
	download_source_url: "Посилання на джерело",
	download_sources: "Джерела для завантаження",
	download_sources_description: "Hydra буде отримувати посилання для завантажень із цих джерел. URL має містити пряме посилання на .json-файл із посиланнями для завантажень.",
	download_sources_synced: "Всі джерела для завантаження синхронізовано",
	enable_real_debrid: "Включити Real-Debrid",
	found_download_option_one: "Знайдено {{countFormatted}} варіант завантаження",
	found_download_option_other: "Знайдено {{countFormatted}} варіантів завантаження",
	found_download_option_zero: "Немає доступних завантажень",
	general: "Основні",
	"import": "Імпортувати",
	insert_valid_json_url: "Вставте дійсний URL JSON-файлу",
	language: "Мова",
	real_debrid_api_token: "API-токен",
	real_debrid_api_token_hint: "API токен можливо отримати <0>тут</0>",
	real_debrid_api_token_label: "Real-Debrid API-токен",
	real_debrid_description: "Real-Debrid — це необмежений завантажувач, який дозволяє швидко завантажувати файли, розміщені в Інтернеті, або миттєво передавати їх у плеєр через приватну мережу, що дозволяє обходити будь-які блокування.",
	real_debrid_free_account_error: "Акаунт \"{{username}}\" - не має наявної підписки. Будь ласка, оформіть підписку на Real-Debrid",
	real_debrid_invalid_token: "Невірний API-токен",
	real_debrid_linked_message: "Акаунт \"{{username}}\" привязаний",
	remove_download_source: "Видалити",
	removed_download_source: "Джерело завантажень було видалено",
	save_changes: "Зберегти зміни",
	sync_download_sources: "Синхронізувати джерела",
	validate_download_source: "Перевірити"
};
const notifications$8 = {
	download_complete: "Завантаження завершено",
	game_ready_to_install: "{{title}} готова до встановлення",
	repack_list_updated: "Список репаків оновлено",
	repack_count_one: "{{count}} репак додано",
	repack_count_other: "{{count}} репаків додано"
};
const system_tray$8 = {
	open: "Відкрити Hydra",
	quit: "Вийти"
};
const game_card$8 = {
	no_downloads: "Немає доступних завантажень"
};
const binary_not_found_modal$8 = {
	title: "Програми не встановлені",
	description: "Виконувані файли Wine або Lutris не знайдено у вашій системі",
	instructions: "Дізнайтеся правильний спосіб встановити будь-який з них на ваш дистрибутив Linux, щоб гра могла нормально працювати"
};
const modal$9 = {
	close: "Закрити"
};
const forms$2 = {
	toggle_password_visibility: "Показувати пароль"
};
const user_profile$2 = {
	activity: "Остання активність",
	amount_hours: "{{amount}} годин",
	amount_minutes: "{{amount}} хвилин",
	cancel: "Скасувати",
	display_name: "Відображуване ім'я",
	edit_profile: "Редагувати профіль",
	last_time_played: "Остання гра {{period}}",
	library: "Бібліотека",
	no_recent_activity_description: "Ви давно не грали в ігри. Пора це змінити!",
	no_recent_activity_title: "Хммм... Тут нічого немає",
	playing_for: "Зіграно {{amount}}",
	save: "Збережено",
	saved_successfully: "Успішно збережено",
	saving: "Збереження",
	sign_out: "Вийти",
	sign_out_modal_text: "Ваша бібліотека пов'язана з поточним обліковим записом. При виході з системи ваша бібліотека буде недоступною, і прогрес не буде збережено. Продовжити вихід?",
	sign_out_modal_title: "Ви впевнені?",
	successfully_signed_out: "Успішний вихід з акаунту",
	total_play_time: "Всього зіграно: {{amount}}",
	try_again: "Будь ласка, попробуйте ще раз"
};
const translation$9 = {
	app: app$2,
	home: home$9,
	sidebar: sidebar$9,
	header: header$9,
	bottom_panel: bottom_panel$9,
	catalogue: catalogue$9,
	game_details: game_details$9,
	activation: activation$9,
	downloads: downloads$9,
	settings: settings$9,
	notifications: notifications$8,
	system_tray: system_tray$8,
	game_card: game_card$8,
	binary_not_found_modal: binary_not_found_modal$8,
	modal: modal$9,
	forms: forms$2,
	user_profile: user_profile$2
};

const app$1 = {
	successfully_signed_in: "已成功登录"
};
const home$8 = {
	featured: "特色推荐",
	trending: "最近热门",
	surprise_me: "向我推荐",
	no_results: "没有找到结果"
};
const sidebar$8 = {
	catalogue: "游戏目录",
	downloads: "下载中心",
	settings: "设置",
	my_library: "我的游戏库",
	downloading_metadata: "{{title}} (正在下载元数据…)",
	paused: "{{title}} (已暂停)",
	downloading: "{{title}} ({{percentage}} - 正在下载…)",
	filter: "筛选游戏库",
	home: "主页",
	queued: "{{title}} (已加入下载队列)",
	game_has_no_executable: "未选择游戏的可执行文件",
	sign_in: "登入"
};
const header$8 = {
	search: "搜索游戏",
	home: "主页",
	catalogue: "游戏目录",
	downloads: "下载中心",
	search_results: "搜索结果",
	settings: "设置",
	version_available_install: "版本 {{version}} 已可用. 点击此处重新启动并安装.",
	version_available_download: "版本 {{version}} 可用. 点击此处下载."
};
const bottom_panel$8 = {
	no_downloads_in_progress: "没有正在进行的下载",
	downloading_metadata: "正在下载{{title}}的元数据…",
	downloading: "正在下载{{title}}… ({{percentage}}完成) - 剩余时间{{eta}} - 速度{{speed}}",
	calculating_eta: "正在下载 {{title}}… (已完成{{percentage}}.) - 正在计算剩余时间..."
};
const catalogue$8 = {
	next_page: "下一页",
	previous_page: "上一页"
};
const game_details$8 = {
	open_download_options: "打开下载选项",
	download_options_zero: "无下载选项",
	download_options_one: "{{count}}个下载选项",
	download_options_other: "{{count}}个下载选项",
	updated_at: "更新于{{updated_at}}",
	install: "安装",
	resume: "恢复",
	pause: "暂停",
	cancel: "取消",
	remove: "移除",
	space_left_on_disk: "磁盘剩余空间{{space}}",
	eta: "预计完成时间{{eta}}",
	downloading_metadata: "正在下载元数据…",
	filter: "筛选重打包",
	requirements: "配置要求",
	minimum: "最低要求",
	recommended: "推荐要求",
	release_date: "发布于{{date}}",
	publisher: "发行商{{publisher}}",
	hours: "小时",
	minutes: "分钟",
	amount_hours: "{{amount}}小时",
	amount_minutes: "{{amount}}分钟",
	accuracy: "准确度{{accuracy}}%",
	add_to_library: "添加到游戏库",
	remove_from_library: "从游戏库移除",
	no_downloads: "没有可用的下载",
	play_time: "游戏时长{{amount}}",
	last_time_played: "上次玩{{period}}",
	not_played_yet: "您还没有玩过{{title}}",
	next_suggestion: "下一个建议",
	play: "开始游戏",
	deleting: "正在删除安装程序…",
	close: "关闭",
	playing_now: "正在游戏中",
	change: "更改",
	repacks_modal_description: "选择您想要下载的重打包",
	select_folder_hint: "要更改默认文件夹,请访问",
	download_now: "立即下载",
	previous_screenshot: "上一张截图",
	next_screenshot: "下一张截图",
	screenshot: "截图 {{number}}",
	open_screenshot: "打开截图 {{number}}",
	download_settings: "下载设置",
	downloader: "下载器",
	select_executable: "选择",
	no_executable_selected: "没有可执行文件被指定",
	open_folder: "打开目录",
	open_download_location: "查看已下载的文件",
	create_shortcut: "创建桌面快捷方式",
	remove_files: "删除文件",
	remove_from_library_title: "你确定吗？",
	remove_from_library_description: "这将会把 {{game}} 从你的库中移除",
	options: "选项",
	executable_section_title: "可执行文件",
	executable_section_description: "点击 \"Play\" 时将执行的文件的路径",
	downloads_secion_title: "下载",
	downloads_section_description: "查看此游戏的更新或其他版本",
	danger_zone_section_title: "危险操作",
	danger_zone_section_description: "从您的库或Hydra下载的文件中删除此游戏",
	download_in_progress: "下载进行中",
	download_paused: "下载暂停",
	last_downloaded_option: "上次下载的选项",
	create_shortcut_success: "成功创建快捷方式",
	create_shortcut_error: "创建快捷方式出错"
};
const activation$8 = {
	title: "激活 Hydra",
	installation_id: "安装ID:",
	enter_activation_code: "输入您的激活码",
	message: "如果你不知道在哪里请求这个,那么您将无法继续。",
	activate: "激活",
	loading: "加载中…"
};
const downloads$8 = {
	resume: "继续",
	pause: "暂停",
	eta: "预计完成时间{{eta}}",
	paused: "已暂停",
	verifying: "正在验证…",
	completed: "已完成",
	cancel: "取消",
	filter: "筛选已下载游戏",
	remove: "移除",
	downloading_metadata: "正在下载元数据…",
	deleting: "正在删除安装程序…",
	"delete": "移除安装程序",
	delete_modal_title: "您确定吗？",
	delete_modal_description: "这将从您的电脑上移除所有的安装文件",
	install: "安装",
	download_in_progress: "进行中",
	queued_downloads: "在队列中的下载",
	downloads_completed: "已完成",
	queued: "下载列表",
	no_downloads_title: "空空如也",
	no_downloads_description: "你还未使用Hydra下载任何游戏,但什么时候开始,都为时不晚。"
};
const settings$8 = {
	downloads_path: "下载路径",
	change: "更改",
	notifications: "通知",
	enable_download_notifications: "下载完成时",
	enable_repack_list_notifications: "添加新重打包时",
	real_debrid_api_token_label: "Real-Debrid API 令牌",
	quit_app_instead_hiding: "关闭Hydra而不是最小化到托盘",
	launch_with_system: "系统启动时运行 Hydra",
	general: "通用",
	behavior: "行为",
	download_sources: "下载源",
	language: "语言",
	real_debrid_api_token: "API 令牌",
	enable_real_debrid: "启用 Real-Debrid",
	real_debrid_description: "Real-Debrid 是一个无限制的下载器，允许您以最快的互联网速度即时下载文件。",
	real_debrid_invalid_token: "无效的 API 令牌",
	real_debrid_api_token_hint: "您可以从<0>这里</0>获取API密钥.",
	real_debrid_free_account_error: "账户 \"{{username}}\" 是免费账户。请订阅 Real-Debrid",
	real_debrid_linked_message: "账户 \"{{username}}\" 已链接",
	save_changes: "保存更改",
	changes_saved: "更改已成功保存",
	download_sources_description: "Hydra 将从这些源获取下载链接。源 URL 必须是直接链接到包含下载链接的 .json 文件。",
	validate_download_source: "验证",
	remove_download_source: "移除",
	add_download_source: "添加源",
	download_count_zero: "列表中无下载",
	download_count_one: "列表中有 {{countFormatted}} 个下载",
	download_count_other: "列表中有 {{countFormatted}} 个下载",
	download_options_zero: "无可用下载",
	download_options_one: "有 {{countFormatted}} 个下载可用",
	download_options_other: "有 {{countFormatted}} 个下载可用",
	download_source_url: "下载源 URL",
	add_download_source_description: "插入包含 .json 文件的 URL",
	download_source_up_to_date: "已更新",
	download_source_errored: "出错",
	sync_download_sources: "同步源",
	removed_download_source: "已移除下载源",
	added_download_source: "已添加下载源",
	download_sources_synced: "所有下载源已同步",
	insert_valid_json_url: "插入有效的 JSON 网址",
	found_download_option_zero: "未找到下载选项",
	found_download_option_one: "找到 {{countFormatted}} 个下载选项",
	found_download_option_other: "找到 {{countFormatted}} 个下载选项",
	"import": "导入"
};
const modal$8 = {
	close: "关闭按钮"
};
const forms$1 = {
	toggle_password_visibility: "切换密码可见性"
};
const user_profile$1 = {
	amount_hours: "{{amount}} 小时",
	amount_minutes: "{{amount}} 分钟",
	last_time_played: "上次游玩时间 {{period}}",
	activity: "近期活动",
	library: "库",
	total_play_time: "总游戏时长: {{amount}}",
	no_recent_activity_title: "Emmm… 这里暂时啥都没有",
	no_recent_activity_description: "你最近没玩过任何游戏。是时候做出改变了!",
	display_name: "昵称",
	saving: "保存中",
	save: "保存",
	edit_profile: "编辑资料",
	saved_successfully: "成功保存",
	try_again: "请重试",
	sign_out_modal_title: "你确定吗?",
	cancel: "取消",
	successfully_signed_out: "登出成功",
	sign_out: "登出",
	playing_for: "Playing for {{amount}}",
	sign_out_modal_text: "您的资料库与您当前的账户相关联。注销后，您的资料库将不再可见，任何进度也不会保存。继续退出吗？"
};
const translation$8 = {
	app: app$1,
	home: home$8,
	sidebar: sidebar$8,
	header: header$8,
	bottom_panel: bottom_panel$8,
	catalogue: catalogue$8,
	game_details: game_details$8,
	activation: activation$8,
	downloads: downloads$8,
	settings: settings$8,
	modal: modal$8,
	forms: forms$1,
	user_profile: user_profile$1
};

const home$7 = {
	featured: "Unggulan",
	trending: "Trending",
	surprise_me: "Kejutkan Saya",
	no_results: "Tidak ada hasil"
};
const sidebar$7 = {
	catalogue: "Katalog",
	downloads: "Unduhan",
	settings: "Pengaturan",
	my_library: "Koleksi saya",
	downloading_metadata: "{{title}} (Mengunduh metadata…)",
	paused: "{{title}} (Terhenti)",
	downloading: "{{title}} ({{percentage}} - Mengunduh…)",
	filter: "Filter koleksi",
	home: "Beranda"
};
const header$7 = {
	search: "Pencarian",
	home: "Beranda",
	catalogue: "Katalog",
	downloads: "Unduhan",
	search_results: "Hasil pencarian",
	settings: "Pengaturan"
};
const bottom_panel$7 = {
	no_downloads_in_progress: "Tidak ada unduhan berjalan",
	downloading_metadata: "Mengunduh metadata {{title}}...",
	downloading: "Mengunduh {{title}}… ({{percentage}} selesai) - Perkiraan {{eta}} - {{speed}}"
};
const catalogue$7 = {
	next_page: "Halaman berikutnya",
	previous_page: "Halaman sebelumnya"
};
const game_details$7 = {
	open_download_options: "Buka opsi unduhan",
	download_options_zero: "Tidak ada opsi unduhan",
	download_options_one: "{{count}} opsi unduhan",
	download_options_other: "{{count}} opsi unduhan",
	updated_at: "Diperbarui {{updated_at}}",
	install: "Install",
	resume: "Lanjutkan",
	pause: "Hentikan sementara",
	cancel: "Batalkan",
	remove: "Hapus",
	space_left_on_disk: "{{space}} tersisa pada disk",
	eta: "Perkiraan {{eta}}",
	downloading_metadata: "Mengunduh metadata…",
	filter: "Saring repacks",
	requirements: "Keperluan sistem",
	minimum: "Minimum",
	recommended: "Rekomendasi",
	release_date: "Dirilis pada {{date}}",
	publisher: "Dipublikasikan oleh {{publisher}}",
	hours: "jam",
	minutes: "menit",
	amount_hours: "{{amount}} jam",
	amount_minutes: "{{amount}} menit",
	accuracy: "{{accuracy}}% akurasi",
	add_to_library: "Tambahkan ke koleksi",
	remove_from_library: "Hapus dari koleksi",
	no_downloads: "Tidak ada unduhan tersedia",
	play_time: "Dimainkan selama {{amount}}",
	last_time_played: "Terakhir dimainkan {{period}}",
	not_played_yet: "Kamu belum memainkan {{title}}",
	next_suggestion: "Rekomendasi berikutnya",
	play: "Mainkan",
	deleting: "Menghapus installer…",
	close: "Tutup",
	playing_now: "Memainkan sekarang",
	change: "Ubah",
	repacks_modal_description: "Pilih repack yang kamu ingin unduh",
	select_folder_hint: "Untuk merubah folder bawaan, akses melalui",
	download_now: "Unduh sekarang"
};
const activation$7 = {
	title: "Aktivasi Hydra",
	installation_id: "ID instalasi:",
	enter_activation_code: "Masukkan kode aktivasi",
	message: "Jika kamu tidak tau dimana bertanya untuk ini, maka kamu tidak seharusnya memiliki ini.",
	activate: "Aktifkan",
	loading: "Memuat…"
};
const downloads$7 = {
	resume: "Lanjutkan",
	pause: "Hentikan sementara",
	eta: "Perkiraan {{eta}}",
	paused: "Terhenti sementara",
	verifying: "Memeriksa…",
	completed: "Selesai",
	cancel: "Batalkan",
	filter: "Saring game yang diunduh",
	remove: "Hapus",
	downloading_metadata: "Mengunduh metadata…",
	deleting: "Menghapus file instalasi…",
	"delete": "Hapus file instalasi",
	delete_modal_title: "Kamu yakin?",
	delete_modal_description: "Proses ini akan menghapus semua file instalasi dari komputer kamu",
	install: "Install"
};
const settings$7 = {
	downloads_path: "Lokasi unduhan",
	change: "Perbarui",
	notifications: "Pengingat",
	enable_download_notifications: "Saat unduhan selesai",
	enable_repack_list_notifications: "Saat repack terbaru ditambahkan",
	behavior: "Perilaku",
	quit_app_instead_hiding: "Tutup aplikasi alih-alih menyembunyikan aplikasi",
	launch_with_system: "Jalankan saat memulai sistem"
};
const notifications$7 = {
	download_complete: "Unduhan selesai",
	game_ready_to_install: "{{title}} sudah siap untuk instalasi",
	repack_list_updated: "Daftar repack diperbarui",
	repack_count_one: "{{count}} repack ditambahkan",
	repack_count_other: "{{count}} repack ditambahkan"
};
const system_tray$7 = {
	open: "Buka Hydra",
	quit: "Tutup"
};
const game_card$7 = {
	no_downloads: "Tidak ada unduhan tersedia"
};
const binary_not_found_modal$7 = {
	title: "Program tidak terinstal",
	description: "Wine atau Lutris exe tidak ditemukan pada sistem kamu",
	instructions: "Periksa cara instalasi yang benar pada Linux distro-mu agar game dapat dimainkan dengan benar"
};
const modal$7 = {
	close: "Tombol tutup"
};
const translation$7 = {
	home: home$7,
	sidebar: sidebar$7,
	header: header$7,
	bottom_panel: bottom_panel$7,
	catalogue: catalogue$7,
	game_details: game_details$7,
	activation: activation$7,
	downloads: downloads$7,
	settings: settings$7,
	notifications: notifications$7,
	system_tray: system_tray$7,
	game_card: game_card$7,
	binary_not_found_modal: binary_not_found_modal$7,
	modal: modal$7
};

const home$6 = {
	featured: "추천",
	trending: "인기",
	surprise_me: "무작위 추천",
	no_results: "결과 없음"
};
const sidebar$6 = {
	catalogue: "카탈로그",
	downloads: "다운로드",
	settings: "설정",
	my_library: "내 라이브러리",
	downloading_metadata: "{{title}} (메타데이터 다운로드 중…)",
	paused: "{{title}} (일시 정지됨)",
	downloading: "{{title}} ({{percentage}} - 다운로드 중…)",
	filter: "라이브러리 정렬",
	home: "홈"
};
const header$6 = {
	search: "게임 검색하기",
	home: "홈",
	catalogue: "카탈로그",
	downloads: "다운로드",
	search_results: "검색 결과",
	settings: "설정"
};
const bottom_panel$6 = {
	no_downloads_in_progress: "진행중인 다운로드 없음",
	downloading_metadata: "{{title}}의 메타데이터를 다운로드 중…",
	downloading: "{{title}}의 파일들을 다운로드 중… ({{percentage}} 완료) - 완료까지 {{eta}} - {{speed}}"
};
const catalogue$6 = {
	next_page: "다음 페이지",
	previous_page: "이전 페이지"
};
const game_details$6 = {
	open_download_options: "다운로드 선택지 열기",
	download_options_zero: "다운로드 선택지 없음",
	download_options_one: "{{count}}개의 다운로드 선택지가 존재함",
	download_options_other: "{{count}}개의 다운로드 선택지들이 존재함",
	updated_at: "{{updated_at}}에 업데이트 됨",
	install: "설치",
	resume: "재개",
	pause: "일시 정지",
	cancel: "취소",
	remove: "제거",
	space_left_on_disk: "여유 저장 용량 {{space}} 남음",
	eta: "완료까지 {{eta}}",
	downloading_metadata: "메타데이터 다운로드 중…",
	filter: "리팩들을 다음과 같이 정렬하기",
	requirements: "시스템 사양",
	minimum: "최저 사양",
	recommended: "권장 사양",
	release_date: "{{date}}에 발매됨",
	publisher: "{{publisher}} 배급",
	hours: "시",
	minutes: "분",
	amount_hours: "{{amount}} 시간",
	amount_minutes: "{{amount}} 분",
	accuracy: "정확도 {{accuracy}}%",
	add_to_library: "라이브러리에 추가",
	remove_from_library: "라이브러리에서 제거",
	no_downloads: "가능한 다운로드 없음",
	play_time: "{{amount}}동안 플레이 함",
	last_time_played: "마지막 플레이 날짜 {{period}}",
	not_played_yet: "{{title}}의 플레이 기록 아직 없음",
	next_suggestion: "다음 추천",
	play: "실행",
	deleting: "인스톨러 삭제 중…",
	close: "닫기",
	playing_now: "현재 플레이 중",
	change: "바꾸기",
	repacks_modal_description: "다운로드 할 리팩을 선택해 주세요",
	select_folder_hint: "기본 폴더를 바꾸려면 <0>설정</0>으로 가세요",
	download_now: "지금 다운로드"
};
const activation$6 = {
	title: "Hydra 실행",
	installation_id: "설치 ID:",
	enter_activation_code: "활성 코드를 입력하세요",
	message: "이것을 어디에서 구해야 할 지 모르겠다면 애초에 갖고 있으면 안 됩니다.",
	activate: "활성화",
	loading: "불러오는중..."
};
const downloads$6 = {
	resume: "재개",
	pause: "일시 정지",
	eta: "완료까지 {{eta}}",
	paused: "일시 정지됨",
	verifying: "검증중…",
	completed: "완료됨",
	cancel: "취소",
	filter: "다운로드 된 게임들을 정렬하기",
	remove: "제거하기",
	downloading_metadata: "메타데이터 다운로드 중…",
	deleting: "인스톨러 삭제 중…",
	"delete": "인스톨러 삭제하기",
	delete_modal_title: "정말로 하시겠습니까?",
	delete_modal_description: "이 기기의 모든 설치 파일들이 제거될 것입니다",
	install: "설치"
};
const settings$6 = {
	downloads_path: "다운로드 경로",
	change: "업데이트",
	notifications: "알림",
	enable_download_notifications: "다운로드가 완료되었을 때",
	enable_repack_list_notifications: "새 리팩이 추가되었을 때",
	quit_app_instead_hiding: "작업 표시줄 트레이로 최소화하는 대신 Hydra를 종료",
	launch_with_system: "컴퓨터가 시작되었을 때 Hydra 실행",
	general: "일반",
	behavior: "행동",
	enable_real_debrid: "Real-Debrid 활성화",
	real_debrid_api_token_hint: "API 키를 <0>이곳</0>에서 얻으세요.",
	save_changes: "변경 사항 저장"
};
const notifications$6 = {
	download_complete: "다운로드 완료",
	game_ready_to_install: "이제 {{title}} 설치할 수 있습니다",
	repack_list_updated: "리팩 목록 갱신됨",
	repack_count_one: "{{count}}개의 리팩이 추가됨",
	repack_count_other: "{{count}}개의 리팩들이 추가됨"
};
const system_tray$6 = {
	open: "Hydra 열기",
	quit: "닫기"
};
const game_card$6 = {
	no_downloads: "가능한 다운로드 없음"
};
const binary_not_found_modal$6 = {
	title: "프로그램이 설치되지 않음",
	description: "Wine 또는 Lutris 실행 파일이 시스템에서 발견되지 않았습니다",
	instructions: "게임이 정상적으로 실행될 수 있게 당신의 리눅스 배포판에 Wine 또는 Lutris를 올바르게 설치해 주세요"
};
const modal$6 = {
	close: "닫기 버튼"
};
const translation$6 = {
	home: home$6,
	sidebar: sidebar$6,
	header: header$6,
	bottom_panel: bottom_panel$6,
	catalogue: catalogue$6,
	game_details: game_details$6,
	activation: activation$6,
	downloads: downloads$6,
	settings: settings$6,
	notifications: notifications$6,
	system_tray: system_tray$6,
	game_card: game_card$6,
	binary_not_found_modal: binary_not_found_modal$6,
	modal: modal$6
};

const home$5 = {
	featured: "Anbefalet",
	trending: "Trender",
	surprise_me: "Overrask mig",
	no_results: "Ingen resultater fundet"
};
const sidebar$5 = {
	catalogue: "Katalog",
	downloads: "Downloads",
	settings: "Indstillinger",
	my_library: "Mit bibliotek",
	downloading_metadata: "{{title}} (Downloader metadata…)",
	paused: "{{title}} (Paused)",
	downloading: "{{title}} ({{percentage}} - Downloading…)",
	filter: "Filtrer bibliotek",
	home: "Hjem"
};
const header$5 = {
	search: "Søg spil",
	home: "Hjem",
	catalogue: "Katalog",
	downloads: "Downloads",
	search_results: "Søge resultater",
	settings: "Indstillinger"
};
const bottom_panel$5 = {
	no_downloads_in_progress: "Ingen downloads igang",
	downloading_metadata: "Downloader {{title}} metadata…",
	downloading: "Downloader {{title}}… ({{percentage}} færdig) - Konklusion {{eta}} - {{speed}}"
};
const catalogue$5 = {
	next_page: "Næste side",
	previous_page: "Tidligere side"
};
const game_details$5 = {
	open_download_options: "Åben download muligheder",
	download_options_zero: "Ingen download mulighed",
	download_options_one: "{{count}} download mulighed",
	download_options_other: "{{count}} download muligheder",
	updated_at: "Opdateret {{updated_at}}",
	install: "Installér",
	resume: "Fortsæt",
	pause: "Pause",
	cancel: "Annullér",
	remove: "Fjern",
	space_left_on_disk: "{{space}} tilbage på harddisken",
	eta: "Konklusion {{eta}}",
	downloading_metadata: "Downloader metadata…",
	filter: "Filtrer repacks",
	requirements: "System behov",
	minimum: "Mindste",
	recommended: "Anbefalet",
	release_date: "Offentliggjort den {{date}}",
	publisher: "Udgivet af {{publisher}}",
	hours: "timer",
	minutes: "minutter",
	amount_hours: "{{amount}} timer",
	amount_minutes: "{{amount}} minutter",
	accuracy: "{{accuracy}}% nøjagtighed",
	add_to_library: "Tilføj til bibliotek",
	remove_from_library: "Fjern fra bibliotek",
	no_downloads: "Ingen downloads tilgængelige",
	play_time: "Spillet i {{amount}}",
	last_time_played: "Sidst spillet {{period}}",
	not_played_yet: "Du har ikke spillet {{title}} endnu",
	next_suggestion: "Næste forslag",
	play: "Spil",
	deleting: "Sletter installatør…",
	close: "Luk",
	playing_now: "Spiller nu",
	change: "Ændré",
	repacks_modal_description: "Vælg den repack du vil downloade",
	select_folder_hint: "For at ændre standard mappen, gå til <0>Instillingerne</0>",
	download_now: "Download nu"
};
const activation$5 = {
	title: "Aktivér Hydra",
	installation_id: "Installations ID:",
	enter_activation_code: "Indtast din aktiverings kode",
	message: "Hvis du ikke ved hvor du skal spørge om dette, burde du ikke have dette.",
	activate: "Aktivér",
	loading: "Loader…"
};
const downloads$5 = {
	resume: "Fortsæt",
	pause: "Pause",
	eta: "Konklusion {{eta}}",
	paused: "Pauset",
	verifying: "Verificerer…",
	completed: "Færdigt",
	cancel: "Annullér",
	filter: "Filtrer downloadet spil",
	remove: "Fjern",
	downloading_metadata: "Downloader metadata…",
	deleting: "Sletter installatør…",
	"delete": "Fjern installatør",
	delete_modal_title: "Er du sikker?",
	delete_modal_description: "Dette vil fjerne alle installations filerne fra din computer",
	install: "Installér"
};
const settings$5 = {
	downloads_path: "Downloads sti",
	change: "Opdatering",
	notifications: "Notifikationer",
	enable_download_notifications: "Når et download bliver færdigt",
	enable_repack_list_notifications: "Når en ny repack bliver tilføjet",
	quit_app_instead_hiding: "Afslut Hydra instedet for at minimere til processlinjen",
	launch_with_system: "Åben Hydra ved start af systemet",
	general: "Generelt",
	behavior: "Opførsel",
	enable_real_debrid: "Slå Real-Debrid til",
	real_debrid_api_token_hint: "Du kan få din API nøgle <0>her</0>",
	save_changes: "Gem ændringer"
};
const notifications$5 = {
	download_complete: "Download færdig",
	game_ready_to_install: "{{title}} er klar til at installeret",
	repack_list_updated: "Repack liste opdateret",
	repack_count_one: "{{count}} repack tilføjet",
	repack_count_other: "{{count}} repacks tilføjet"
};
const system_tray$5 = {
	open: "Åben Hydra",
	quit: "Afslut"
};
const game_card$5 = {
	no_downloads: "Ingen downloads tilgængelig"
};
const binary_not_found_modal$5 = {
	title: "Programmer ikke installeret",
	description: "Wine eller Lutris eksekverbare blev ikke fundet på dit system",
	instructions: "Tjek den korrekte måde at installere nogle af dem, på din Linux distribution, så spillet kan køre normalt"
};
const modal$5 = {
	close: "Luk knap"
};
const translation$5 = {
	home: home$5,
	sidebar: sidebar$5,
	header: header$5,
	bottom_panel: bottom_panel$5,
	catalogue: catalogue$5,
	game_details: game_details$5,
	activation: activation$5,
	downloads: downloads$5,
	settings: settings$5,
	notifications: notifications$5,
	system_tray: system_tray$5,
	game_card: game_card$5,
	binary_not_found_modal: binary_not_found_modal$5,
	modal: modal$5
};

const home$4 = {
	featured: "مميّز",
	trending: "شائع",
	surprise_me: "فاجئني",
	no_results: "لم يتم العثور على نتائج"
};
const sidebar$4 = {
	catalogue: "قائمة الألعاب",
	downloads: "التحميلات",
	settings: "إعدادات",
	my_library: "مكتبتي",
	downloading_metadata: "{{title}} (جارٍ تنزيل البيانات الوصفية...)",
	paused: "{{title}} (متوقف)",
	downloading: "{{title}} ({{percentage}} - جارٍ التنزيل...)",
	filter: "بحث في المكتبة",
	home: "الرئيسية"
};
const header$4 = {
	search: "ابحث عن الألعاب",
	home: "الرئيسية",
	catalogue: "قائمة الألعاب",
	downloads: "التحميلات",
	search_results: "نتائج البحث",
	settings: "إعدادات"
};
const bottom_panel$4 = {
	no_downloads_in_progress: "لا يوجد تنزيلات جارية",
	downloading_metadata: "جارٍ تنزيل بيانات وصف {{title}}",
	downloading: "جارٍ تنزيل {{title}}… ({{percentage}} مكتملة) - الانتهاء {{eta}} - {{speed}}"
};
const catalogue$4 = {
	next_page: "الصفحة التالية",
	previous_page: "الصفحة السابقة"
};
const game_details$4 = {
	open_download_options: "افتح خيارات التنزيل",
	download_options_zero: "لا يوجد خيار تنزيل",
	download_options_one: "{{count}} خيار تنزيل",
	download_options_other: "{{count}} خيار تنزيل",
	updated_at: "تم التحديث {{updated_at}}",
	install: "تثبيت",
	resume: "استئناف",
	pause: "إيقاف",
	cancel: "إلغاء",
	remove: "إزالة",
	space_left_on_disk: "{{space}} متبقية على القرص",
	eta: "الوقت المتبقي {{eta}}",
	downloading_metadata: "جاري تنزيل البيانات الوصفية...",
	filter: "تصفية حزم إعادة التجميع",
	requirements: "متطلبات النظام",
	minimum: "الحد الأدنى",
	recommended: "موصى به",
	release_date: "تم الإصدار في {{date}}",
	publisher: "نشر بواسطة {{publisher}}",
	hours: "ساعات",
	minutes: "دقائق",
	amount_hours: "{{amount}} ساعات",
	amount_minutes: "{{amount}} دقائق",
	accuracy: "دقة {{accuracy}}%",
	add_to_library: "إضافة إلى المكتبة",
	remove_from_library: "إزالة من المكتبة",
	no_downloads: "لا توجد تنزيلات متاحة",
	play_time: "تم اللعب لمدة {{amount}}",
	last_time_played: "آخر مرة لعبت {{period}}",
	not_played_yet: "لم تلعب {{title}} بعد",
	next_suggestion: "الاقتراح التالي",
	play: "لعب",
	deleting: "جاري حذف المثبت...",
	close: "إغلاق",
	playing_now: "قيد التشغيل الآن",
	change: "تغيير",
	repacks_modal_description: "اختر الحزمة التي تريد تنزيلها",
	select_folder_hint: "لتغيير المجلد الافتراضي، انتقل إلى الإعدادات",
	download_now: "تنزيل الآن",
	no_shop_details: "لم يتم استرداد تفاصيل المتجر.",
	download_options: "خيارات التنزيل",
	download_path: "مسار التنزيل",
	previous_screenshot: "لقطة الشاشة السابقة",
	next_screenshot: "لقطة الشاشة التالية",
	screenshot: "لقطة شاشة {{number}}",
	open_screenshot: "افتح لقطة الشاشة {{number}}"
};
const activation$4 = {
	title: "تفعيل هايدرا",
	installation_id: "معرف التثبيت:",
	enter_activation_code: "أدخل رمز التفعيل الخاص بك",
	message: "إذا كنت لا تعرف أين تسأل عن هذا ، فلا يجب أن يكون لديك هذا.",
	activate: "تفعيل",
	loading: "جار التحميل…"
};
const downloads$4 = {
	resume: "استئناف",
	pause: "إيقاف مؤقت",
	eta: "الوقت المتبقي {{eta}}",
	paused: "متوقفة مؤقتًا",
	verifying: "جار التحقق…",
	completed: "اكتمل",
	cancel: "إلغاء",
	filter: "تصفية الألعاب التي تم تنزيلها",
	remove: "إزالة",
	downloading_metadata: "جار تنزيل البيانات الوصفية…",
	deleting: "جار حذف المثبت…",
	"delete": "إزالة المثبت",
	delete_modal_title: "هل أنت متأكد؟",
	delete_modal_description: "سيؤدي هذا إلى إزالة جميع ملفات التثبيت من جهاز الكمبيوتر الخاص بك",
	install: "تثبيت"
};
const settings$4 = {
	downloads_path: "مسار التنزيلات",
	change: "تحديث",
	notifications: "الإشعارات",
	enable_download_notifications: "عند اكتمال التنزيل",
	enable_repack_list_notifications: "عند إضافة حزمة جديدة",
	real_debrid_api_token_label: "رمز واجهة برمجة التطبيقات (API) لـReal-Debrid ",
	quit_app_instead_hiding: "إنهاء هايدرا بدلاً من التصغير الى شريط الحالة",
	launch_with_system: "تشغيل هايدرا عند بدء تشغيل النظام",
	general: "عام",
	behavior: "السلوك",
	enable_real_debrid: "تفعيل Real-Debrid ",
	real_debrid_api_token_hint: "يمكنك الحصول على مفتاح API الخاص بك هنا",
	save_changes: "حفظ التغييرات"
};
const notifications$4 = {
	download_complete: "تم التحميل",
	game_ready_to_install: "{{title}} جاهزة للتثبيت",
	repack_list_updated: "قائمة التجميعات المحدثة",
	repack_count_one: "{{count}} حزمة مضافة",
	repack_count_other: "{{count}} حزم مُضافة"
};
const system_tray$4 = {
	open: "فتح هايدرا",
	quit: "خروج"
};
const game_card$4 = {
	no_downloads: "لا توجد تنزيلات متاحة"
};
const binary_not_found_modal$4 = {
	title: "البرامج غير مثبتة",
	description: "لم يتم العثور على ملفات Wine أو Lutris التنفيذية على نظامك",
	instructions: "تحقق من الطريقة الصحيحة لتثبيت أي منها على توزيعة Linux الخاصة بك حتى تعمل اللعبة بشكل طبيعي"
};
const modal$4 = {
	close: "زر إغلاق"
};
const translation$4 = {
	home: home$4,
	sidebar: sidebar$4,
	header: header$4,
	bottom_panel: bottom_panel$4,
	catalogue: catalogue$4,
	game_details: game_details$4,
	activation: activation$4,
	downloads: downloads$4,
	settings: settings$4,
	notifications: notifications$4,
	system_tray: system_tray$4,
	game_card: game_card$4,
	binary_not_found_modal: binary_not_found_modal$4,
	modal: modal$4
};

const home$3 = {
	featured: "پیشنهادی",
	trending: "پرطرفدار",
	surprise_me: "سوپرایزم کن",
	no_results: "اتمام‌ای پیدا نشد"
};
const sidebar$3 = {
	catalogue: "کاتالوگ",
	downloads: "دانلودها",
	settings: "تنظیمات",
	my_library: "کتابخانه‌ی من",
	downloading_metadata: "{{title}} (در حال دانلود متادیتا...)",
	paused: "{{title}} (متوقف شده)",
	downloading: "{{title}} ({{percentage}} - در حال دانلود…)",
	filter: "فیلتر کردن کتابخانه",
	home: "خانه"
};
const header$3 = {
	search: "جستجوی  بازی‌ها",
	home: "خانه",
	catalogue: "کاتالوگ",
	downloads: "دانلود‌ها",
	search_results: "نتایج جستجو",
	settings: "تنظیمات"
};
const bottom_panel$3 = {
	no_downloads_in_progress: "دانلودی در حال انجام نیست",
	downloading_metadata: "درحال دانلود متادیتاهای {{title}}…",
	downloading: "در حال دانلود {{title}}… ({{percentage}} تکمیل شده) - اتمام {{eta}} - {{speed}}"
};
const catalogue$3 = {
	next_page: "صفحه‌ی بعدی",
	previous_page: "صفحه‌ی قبلی"
};
const game_details$3 = {
	open_download_options: "بازکردن آپشن‌های دانلود",
	download_options_zero: "هیچ آپشن دانلودی وجود ندارد",
	download_options_one: "{{count}} آپشن دانلود",
	download_options_other: "{{count}} آپشن دانلود",
	updated_at: "بروزرسانی شده در {{updated_at}}",
	install: "نصب",
	resume: "ادامه",
	pause: "توقف",
	cancel: "بیخیال",
	remove: "حذف",
	space_left_on_disk: "{{space}} فضا در دیسک باقی‌مانده",
	eta: "اتمام {{eta}}",
	downloading_metadata: "در حال دانلود متادیتاها…",
	filter: "فیلترکردن ریپک‌ها",
	requirements: "سیستم مورد نیاز",
	minimum: "حداقل",
	recommended: "پیشنهادی",
	release_date: "منتشر شده در {{date}}",
	publisher: "منتشر شده توسط {{publisher}}",
	hours: "ساعت",
	minutes: "دقیقه",
	amount_hours: "{{amount}} ساعت",
	amount_minutes: "{{amount}} دقیقه",
	accuracy: "{{accuracy}}% دقت",
	add_to_library: "اضافه کردن به کتابخانه",
	remove_from_library: "حذف کردن از کتابخانه",
	no_downloads: "هیچ دانلودی نیست",
	play_time: "{{amount}} بازی شده",
	last_time_played: "آخرین بار بازی شده {{period}}",
	not_played_yet: "شما هنوز {{title}} را بازی نکرده‌اید",
	next_suggestion: "پیشنهاد بعدی",
	play: "بازی",
	deleting: "پاک کردن نصب کننده",
	close: "بستن",
	playing_now: "در حال بازی",
	change: "تغییر",
	repacks_modal_description: "ریپک مورد نظر برای دانلود را انتخاب کنید",
	select_folder_hint: "برای تغییر پوشه‌ی پیش‌فرض به <0>Settings</0> بروید",
	download_now: "الان دانلود کن"
};
const activation$3 = {
	title: "فعال کردن هایدرا",
	installation_id: "ID نصب:",
	enter_activation_code: "کد فعال‌سازی خود را وارد کنید",
	message: "اگر نمی‌دانید از کجا باید درخواست کنید، پس نباید آن را داشته باشید.",
	activate: "فعال‌سازی",
	loading: "در حال بارگزاری…"
};
const downloads$3 = {
	resume: "ادامه",
	pause: "توقف",
	eta: "اتمام {{eta}}",
	paused: "متوقف شده",
	verifying: "در حال اعتبارسنجی…",
	completed: "پایان یافته",
	cancel: "لغو",
	filter: "فیلتر بازی‌های دانلود شده",
	remove: "حذف",
	downloading_metadata: "در حال دانلود متادیتاها…",
	deleting: "در حال پاک کردن اینستالر…",
	"delete": "پاک کردن",
	delete_modal_title: "مطمئنی؟",
	delete_modal_description: "این کار تمام فایل‌های اینستالر را از کامپیوتر شما حذف می‌کند",
	install: "نصف"
};
const settings$3 = {
	downloads_path: "مسیر دانلودها",
	change: "بروزرسانی",
	notifications: "نوتیفیکشن‌ها",
	enable_download_notifications: "زمانی که یک دانلود تمام شد",
	enable_repack_list_notifications: "زمانی که یک ریپک جدید اضافه شد",
	quit_app_instead_hiding: "به جای کوچک کردن، از هایدرا خارج شو",
	launch_with_system: "زمانی که سیستم روشن می‌شود، هایدرا را باز کن",
	general: "کلی",
	behavior: "رفتار",
	enable_real_debrid: "فعال‌سازی Real-Debrid",
	real_debrid_api_token_hint: "کلید API خود را از <ب0>اینجا</0> بگیرید.",
	save_changes: "ذخیره تغییرات"
};
const notifications$3 = {
	download_complete: "دانلود تمام شد",
	game_ready_to_install: "{{title}} آماده‌ی نصب است",
	repack_list_updated: "لیست ریپک‌ها بروزرسانی شد",
	repack_count_one: "{{count}} ریپک اضافه شد",
	repack_count_other: "{{count}} ریپک اضافه شد"
};
const system_tray$3 = {
	open: "باز کردن هایدرا",
	quit: "خروج"
};
const game_card$3 = {
	no_downloads: "هیچ دانلودی نیست"
};
const binary_not_found_modal$3 = {
	title: "نرم‌افزاری نصب نیست",
	description: "بر روی سیستم شما پیدا نشد Wine یا Lutris فایل‌های اجرایی",
	instructions: "روش صحیح نصب هر کدام از آن‌ها رو روی لینوکس خود چک کنید تا بازی بتواند به درستی اجرا شود"
};
const modal$3 = {
	close: "دکمه‌ی خروج"
};
const translation$3 = {
	home: home$3,
	sidebar: sidebar$3,
	header: header$3,
	bottom_panel: bottom_panel$3,
	catalogue: catalogue$3,
	game_details: game_details$3,
	activation: activation$3,
	downloads: downloads$3,
	settings: settings$3,
	notifications: notifications$3,
	system_tray: system_tray$3,
	game_card: game_card$3,
	binary_not_found_modal: binary_not_found_modal$3,
	modal: modal$3
};

const home$2 = {
	featured: "Recomandate",
	trending: "Populare",
	surprise_me: "Surprinde-mă",
	no_results: "Niciun rezultat găsit"
};
const sidebar$2 = {
	catalogue: "Catalog",
	downloads: "Descărcări",
	settings: "Setări",
	my_library: "Biblioteca mea",
	downloading_metadata: "{{title}} (Se descarcă metadata...)",
	paused: "{{title}} (Pauzat)",
	downloading: "{{title}} ({{percentage}} - Se descarcă...)",
	filter: "Filtrează biblioteca",
	home: "Acasă"
};
const header$2 = {
	search: "Caută jocuri",
	home: "Acasă",
	catalogue: "Catalog",
	downloads: "Descărcări",
	search_results: "Rezultatele căutării",
	settings: "Setări"
};
const bottom_panel$2 = {
	no_downloads_in_progress: "Nicio descărcare în curs",
	downloading_metadata: "Se descarcă metadata pentru {{title}}...",
	downloading: "Se descarcă {{title}}... ({{percentage}} complet) - Concluzie {{eta}} - {{speed}}",
	calculating_eta: "Se descarcă {{title}}... ({{percentage}} complet) - Calculare timp rămas..."
};
const catalogue$2 = {
	next_page: "Pagina următoare",
	previous_page: "Pagina anterioară"
};
const game_details$2 = {
	open_download_options: "Deschide opțiunile de descărcare",
	download_options_zero: "Nicio opțiune de descărcare",
	download_options_one: "{{count}} opțiune de descărcare",
	download_options_other: "{{count}} opțiuni de descărcare",
	updated_at: "Actualizat la {{updated_at}}",
	install: "Instalează",
	resume: "Reia",
	pause: "Pauză",
	cancel: "Anulează",
	remove: "Elimină",
	space_left_on_disk: "{{space}} liber pe disc",
	eta: "Concluzie {{eta}}",
	calculating_eta: "Calculare timp rămas...",
	downloading_metadata: "Se descarcă metadata...",
	filter: "Filtrează repack-urile",
	requirements: "Cerințe de sistem",
	minimum: "Minim",
	recommended: "Recomandat",
	paused: "Pauzat",
	release_date: "Lansat pe {{date}}",
	publisher: "Publicat de {{publisher}}",
	hours: "ore",
	minutes: "minute",
	amount_hours: "{{amount}} ore",
	amount_minutes: "{{amount}} minute",
	accuracy: "{{accuracy}}% acuratețe",
	add_to_library: "Adaugă în bibliotecă",
	remove_from_library: "Elimină din bibliotecă",
	no_downloads: "Nicio descărcare disponibilă",
	play_time: "Jucat timp de {{amount}}",
	last_time_played: "Ultima dată jucat {{period}}",
	not_played_yet: "Nu ai jucat încă {{title}}",
	next_suggestion: "Sugestia următoare",
	play: "Joacă",
	deleting: "Se șterge programul de instalare...",
	close: "Închide",
	playing_now: "Se joacă acum",
	change: "Schimbă",
	repacks_modal_description: "Alege repack-ul pe care vrei să-l descarci",
	select_folder_hint: "Pentru a schimba folderul predefinit, mergi la <0>Setări</0>",
	download_now: "Descarcă acum",
	no_shop_details: "Nu s-au putut obține detalii din magazin.",
	download_options: "Opțiuni de descărcare",
	download_path: "Locația de descărcare",
	previous_screenshot: "Captura de ecran anterioară",
	next_screenshot: "Captura de ecran următoare",
	screenshot: "Captură de ecran {{number}}",
	open_screenshot: "Deschide captura de ecran {{number}}",
	download_settings: "Setări de descărcare",
	downloader: "Program de descărcare"
};
const activation$2 = {
	title: "Activează Hydra",
	installation_id: "ID-ul de instalare:",
	enter_activation_code: "Introdu codul de activare",
	message: "Dacă nu știi de unde să ceri acest lucru, atunci nu ar trebui să-l ai.",
	activate: "Activează",
	loading: "Se încarcă..."
};
const downloads$2 = {
	resume: "Reia",
	pause: "Pauză",
	eta: "Concluzie {{eta}}",
	paused: "Pauzat",
	verifying: "Se verifică...",
	completed: "Completat",
	removed: "Nu este descărcat",
	cancel: "Anulează",
	filter: "Filtrează jocurile descărcate",
	remove: "Elimină",
	downloading_metadata: "Se descarcă metadata...",
	deleting: "Se șterge programul de instalare...",
	"delete": "Elimină programul de instalare",
	delete_modal_title: "Ești sigur?",
	delete_modal_description: "Aceasta va elimina toate fișierele de instalare de pe computer",
	install: "Instalează"
};
const settings$2 = {
	downloads_path: "Locația de descărcare",
	change: "Actualizează",
	notifications: "Notificări",
	enable_download_notifications: "Când o descărcare este completă",
	enable_repack_list_notifications: "Când un nou repack este adăugat",
	real_debrid_api_token_label: "Token API Real-Debrid",
	quit_app_instead_hiding: "Nu ascunde Hydra la închidere",
	launch_with_system: "Lansează Hydra la pornirea sistemului",
	general: "General",
	behavior: "Comportament",
	language: "Limbă",
	real_debrid_api_token: "Token API",
	enable_real_debrid: "Activează Real-Debrid",
	real_debrid_description: "Real-Debrid este un descărcător fără restricții care îți permite să descarci fișiere instantaneu și la cea mai bună viteză a internetului tău.",
	real_debrid_invalid_token: "Token API invalid",
	real_debrid_api_token_hint: "Poți obține token-ul tău API <0>aici</0>",
	real_debrid_free_account_error: "Contul \"{{username}}\" este un cont gratuit. Te rugăm să te abonezi la Real-Debrid",
	real_debrid_linked_message: "Contul \"{{username}}\" a fost legat",
	save_changes: "Salvează modificările",
	changes_saved: "Modificările au fost salvate cu succes"
};
const notifications$2 = {
	download_complete: "Descărcare completă",
	game_ready_to_install: "{{title}} este gata de instalare",
	repack_list_updated: "Lista de repack-uri a fost actualizată",
	repack_count_one: "{{count}} repack adăugat",
	repack_count_other: "{{count}} repack-uri adăugate"
};
const system_tray$2 = {
	open: "Deschide Hydra",
	quit: "Ieși"
};
const game_card$2 = {
	no_downloads: "Nicio descărcare disponibilă"
};
const binary_not_found_modal$2 = {
	title: "Programele nu sunt instalate",
	description: "Fișierele executabile Wine sau Lutris nu au fost găsite pe sistemul tău",
	instructions: "Verifică modul corect de instalare a oricăruia dintre acestea pe distribuția ta Linux pentru ca jocul să ruleze normal"
};
const modal$2 = {
	close: "Buton de închidere"
};
const translation$2 = {
	home: home$2,
	sidebar: sidebar$2,
	header: header$2,
	bottom_panel: bottom_panel$2,
	catalogue: catalogue$2,
	game_details: game_details$2,
	activation: activation$2,
	downloads: downloads$2,
	settings: settings$2,
	notifications: notifications$2,
	system_tray: system_tray$2,
	game_card: game_card$2,
	binary_not_found_modal: binary_not_found_modal$2,
	modal: modal$2
};

const home$1 = {
	featured: "Destacats",
	trending: "Populars",
	surprise_me: "Sorprèn-me",
	no_results: "No s'ha trobat res"
};
const sidebar$1 = {
	catalogue: "Catàleg",
	downloads: "Baixades",
	settings: "Configuració",
	my_library: "Biblioteca",
	downloading_metadata: "{{title}} (S'estan baixant les metadades…)",
	paused: "{{title}} (Pausat)",
	downloading: "{{title}} ({{percentage}} - S'està baixant…)",
	filter: "Filtra la biblioteca",
	home: "Inici"
};
const header$1 = {
	search: "Cerca jocs",
	home: "Inici",
	catalogue: "Catàleg",
	downloads: "Baixades",
	search_results: "Resultats de la cerca",
	settings: "Configuració",
	version_available_install: "Hi ha disponible la versió {{version}}. Feu clic aquí per a reiniciar i instal·lar-la.",
	version_available_download: "Hi ha disponible la versió {{version}}. Feu clic aquí per a baixar-la."
};
const bottom_panel$1 = {
	no_downloads_in_progress: "Cap baixada en curs",
	downloading_metadata: "S'estan baixant les metadades de: {{title}}…",
	downloading: "S'està baixant: {{title}}… ({{percentage}} complet) - Finalització: {{eta}} - {{speed}}"
};
const catalogue$1 = {
	next_page: "Pàgina següent",
	previous_page: "Pàgina anterior"
};
const game_details$1 = {
	open_download_options: "Obre les opcions de baixada",
	download_options_zero: "No hi ha opcions de baixada",
	download_options_one: "{{count}} opció de baixada",
	download_options_other: "{{count}} opcions de baixada",
	updated_at: "Actualitzat: {{updated_at}}",
	install: "Instal·la",
	resume: "Reprèn",
	pause: "Pausa",
	cancel: "Cancel·la",
	remove: "Elimina",
	space_left_on_disk: "{{space}} lliures al disc",
	eta: "Finalització: {{eta}}",
	downloading_metadata: "S'estan baixant les metadades…",
	filter: "Filtra els reempaquetats",
	requirements: "Requisits del sistema",
	minimum: "Mínims",
	recommended: "Recomanats",
	release_date: "Publicat el {{date}}",
	publisher: "Publicat per {{publisher}}",
	hours: "hores",
	minutes: "minuts",
	amount_hours: "{{amount}} hores",
	amount_minutes: "{{amount}} minuts",
	accuracy: "{{accuracy}}% de precisió",
	add_to_library: "Afegeix a la biblioteca",
	remove_from_library: "Elimina de la biblioteca",
	no_downloads: "No hi ha baixades disponibles",
	play_time: "Jugat durant {{amount}}",
	last_time_played: "Última partida: {{period}}",
	not_played_yet: "Encara no has jugat al {{title}}",
	next_suggestion: "Suggeriment següent",
	play: "Inicia",
	deleting: "S'està eliminant l'instal·lador…",
	close: "Tanca",
	playing_now: "S'està jugant",
	change: "Canvia",
	repacks_modal_description: "Tria quin reempaquetat vols baixar",
	select_folder_hint: "Per a canviar la carpeta predefinida, vés a la <0>Configuració</0>",
	download_now: "Baixa ara",
	no_shop_details: "No s'han pogut recuperar els detalls de la tenda.",
	download_options: "Opcions de baixada",
	download_path: "Ruta de baixada",
	previous_screenshot: "Captura anterior",
	next_screenshot: "Captura següent",
	screenshot: "Captura {{number}}",
	open_screenshot: "Obre la captura {{number}}"
};
const activation$1 = {
	title: "Activa l'Hydra",
	installation_id: "ID d'instal·lació:",
	enter_activation_code: "Introdueix el codi d'activació",
	message: "Si no saps on demanar-ho, no ho hauries de tenir.",
	activate: "Activa",
	loading: "S'està carregant…"
};
const downloads$1 = {
	resume: "Reprèn",
	pause: "Pausa",
	eta: "Finalització {{eta}}",
	paused: "Pausada",
	verifying: "S'està verificant…",
	completed: "Completada",
	cancel: "Cancel·la",
	filter: "Filtra els jocs baixats",
	remove: "Elimina",
	downloading_metadata: "S'estan baixant les metadades…",
	deleting: "S'està eliminant l'instal·lador…",
	"delete": "Elimina l'instal·lador",
	delete_modal_title: "N'estàs segur?",
	delete_modal_description: "S'eliminaran de l'ordinador tots els fitxers d'instal·lació",
	install: "Instal·la"
};
const settings$1 = {
	downloads_path: "Ruta de baixades",
	change: "Actualitza",
	notifications: "Notificacions",
	enable_download_notifications: "Quan finalitzi una baixada",
	enable_repack_list_notifications: "Quan s'afegeixi un nou reempaquetat",
	real_debrid_api_token_label: "Testimoni de l'API de Real Debrid",
	quit_app_instead_hiding: "Tanca l'Hydra en compte de minimitzar-la a la safata",
	launch_with_system: "Inicia l'Hydra quan s'iniciï el sistema",
	general: "General",
	behavior: "Comportament",
	enable_real_debrid: "Activa el Real Debrid",
	real_debrid_api_token_hint: "Pots obtenir la teva clau de l'API <0>aquí</0>.",
	save_changes: "Desa els canvis"
};
const notifications$1 = {
	download_complete: "La baixada ha finalitzat",
	game_ready_to_install: "{{title}} ja es pot instal·lar",
	repack_list_updated: "S'ha actualitzat la llista de reempaquetats",
	repack_count_one: "S'ha afegit {{count}} reempaquetat",
	repack_count_other: "S'han afegit {{count}} reempaquetats"
};
const system_tray$1 = {
	open: "Obre l'Hydra",
	quit: "Tanca"
};
const game_card$1 = {
	no_downloads: "No hi ha baixades disponibles"
};
const binary_not_found_modal$1 = {
	title: "Programes no instal·lats",
	description: "No s'ha trobat els executables del Wine o el Lutris al sistema.",
	instructions: "Comprova quina és la manera correcta d'instal·lar qualsevol d'ells en la teva distribució de Linux perquè el joc pugui executar-se amb normalitat."
};
const modal$1 = {
	close: "Botó de tancar"
};
const translation$1 = {
	home: home$1,
	sidebar: sidebar$1,
	header: header$1,
	bottom_panel: bottom_panel$1,
	catalogue: catalogue$1,
	game_details: game_details$1,
	activation: activation$1,
	downloads: downloads$1,
	settings: settings$1,
	notifications: notifications$1,
	system_tray: system_tray$1,
	game_card: game_card$1,
	binary_not_found_modal: binary_not_found_modal$1,
	modal: modal$1
};

const app = {
	successfully_signed_in: "Сәтті кіру"
};
const home = {
	featured: "Ұсынылған",
	trending: "Трендте",
	surprise_me: "Таңқалдыр",
	no_results: "Ештеңе табылмады"
};
const sidebar = {
	catalogue: "Каталог",
	downloads: "Жүктеулер",
	settings: "Параметрлер",
	my_library: "Кітапхана",
	downloading_metadata: "{{title}} (Метадеректерді жүктеу…)",
	paused: "{{title}} (Тоқтатылды)",
	downloading: "{{title}} ({{percentage}} - Жүктеу…)",
	filter: "Кітапхана фильтрі",
	home: "Басты бет",
	queued: "{{title}} (Кезекте)",
	game_has_no_executable: "Ойынды іске қосу файлы таңдалмаған",
	sign_in: "Кіру"
};
const header = {
	search: "Іздеу",
	home: "Басты бет",
	catalogue: "Каталог",
	downloads: "Жүктеулер",
	search_results: "Іздеу нәтижелері",
	settings: "Параметрлер",
	version_available_install: "Қол жетімді нұсқа {{version}}. Қайта іске қосу және орнату үшін мұнда басыңыз.",
	version_available_download: "Қол жетімді нұсқа {{version}}. Жүктеу үшін мұнда басыңыз."
};
const bottom_panel = {
	no_downloads_in_progress: "Белсенді жүктеулер жоқ",
	downloading_metadata: "Метадеректерді жүктеу {{title}}…",
	downloading: "Жүктеу {{title}}… ({{percentage}} аяқталды) - Аяқтау {{eta}} - {{speed}}",
	calculating_eta: "Жүктеу {{title}}… ({{percentage}} аяқталды) - Қалған уақытты есептеу…"
};
const catalogue = {
	next_page: "Келесі бет",
	previous_page: "Алдыңғы бет"
};
const game_details = {
	open_download_options: "Жүктеу нұсқаларын ашу",
	download_options_zero: "Жүктеу нұсқалары жоқ",
	download_options_one: "{{count}} жүктеу нұсқасы",
	download_options_other: "{{count}} жүктеу нұсқалары",
	updated_at: "Жаңартылды {{updated_at}}",
	install: "Орнату",
	resume: "Жандандыру",
	pause: "Тоқтату",
	cancel: "Болдырмау",
	remove: "Жою",
	space_left_on_disk: "{{space}} бос орын",
	eta: "Аяқтау {{eta}}",
	calculating_eta: "Қалған уақытты есептеу…",
	downloading_metadata: "Метадеректерді жүктеу…",
	filter: "Репактар фильтрі",
	requirements: "Жүйелік талаптар",
	minimum: "Минималды",
	recommended: "Ұсынылған",
	paused: "Тоқтатылды",
	release_date: "Шыққан күні {{date}}",
	publisher: "Баспагер {{publisher}}",
	hours: "сағат",
	minutes: "минут",
	amount_hours: "{{amount}} сағат",
	amount_minutes: "{{amount}} минут",
	accuracy: "дәлдік {{accuracy}}%",
	add_to_library: "Кітапханаға қосу",
	remove_from_library: "Кітапханадан жою",
	no_downloads: "Жүктеулер жоқ",
	play_time: "Ойнау уақыты {{amount}}",
	last_time_played: "Соңғы ойнаған уақыт {{period}}",
	not_played_yet: "Сіз {{title}} ойнамағансыз",
	next_suggestion: "Келесі ұсыныс",
	play: "Ойнау",
	deleting: "Орнатушыны жою…",
	close: "Жабу",
	playing_now: "Қазір ойнап жатыр",
	change: "Өзгерту",
	repacks_modal_description: "Жүктеу үшін репакты таңдаңыз",
	select_folder_hint: "Әдепкі жүктеу қалтасын өзгерту үшін <0>Параметрлер</0> ашыңыз",
	download_now: "Қазір жүктеу",
	no_shop_details: "Сипаттаманы алу мүмкін болмады",
	download_options: "Жүктеу нұсқалары",
	download_path: "Жүктеу жолы",
	previous_screenshot: "Алдыңғы скриншот",
	next_screenshot: "Келесі скриншот",
	screenshot: "Скриншот {{number}}",
	open_screenshot: "Скриншотты ашу {{number}}",
	download_settings: "Жүктеу параметрлері",
	downloader: "Жүктегіш",
	select_executable: "Таңдау",
	no_executable_selected: "Файл таңдалмаған",
	open_folder: "Қалтаны ашу",
	open_download_location: "Жүктеу қалтасын қарау",
	create_shortcut: "Жұмыс үстелінде жарлық жасау",
	remove_files: "Файлдарды жою",
	remove_from_library_title: "Сіз сенімдісіз бе?",
	remove_from_library_description: "{{game}} сіздің кітапханаңыздан жойылады.",
	options: "Параметрлер",
	executable_section_title: "Файл",
	executable_section_description: "\"Ойнау\" батырмасын басқанда іске қосылатын файл жолы",
	downloads_secion_title: "Жүктеулер",
	downloads_section_description: "Ойынның жаңартулары немесе басқа нұсқалары бар-жоғын тексеру",
	danger_zone_section_title: "Қауіпті аймақ",
	danger_zone_section_description: "Осы ойынды кітапханаңыздан жою немесе Hydra жүктеген файлдарды жою",
	download_in_progress: "Жүктеу жүріп жатыр",
	download_paused: "Жүктеу тоқтатылды",
	last_downloaded_option: "Соңғы жүктеу нұсқасы",
	create_shortcut_success: "Жарлық жасалды",
	create_shortcut_error: "Жарлық жасау мүмкін болмады"
};
const activation = {
	title: "Hydra-ны белсендіру",
	installation_id: "Орнату ID:",
	enter_activation_code: "Активтендіру кодын енгізіңіз",
	message: "Егер оның қайдан алуға болатынын білмесеңіз, сізде оның болмауы керек.",
	activate: "Белсендіру",
	loading: "Жүктеу…"
};
const downloads = {
	resume: "Жандандыру",
	pause: "Тоқтату",
	eta: "Аяқтау {{eta}}",
	paused: "Тоқтатылды",
	verifying: "Тексеру…",
	completed: "Аяқталды",
	removed: "Жүктелмеген",
	cancel: "Болдырмау",
	filter: "Жүктелген ойындар фильтрі",
	remove: "Жою",
	downloading_metadata: "Метадеректерді жүктеу…",
	deleting: "Орнатушыны жою…",
	"delete": "Орнатушыны жою",
	delete_modal_title: "Сіз сенімдісіз бе?",
	delete_modal_description: "Бұл барлық орнатушыларды компьютеріңізден жояды",
	install: "Орнату",
	download_in_progress: "Жүктеу жүріп жатыр",
	queued_downloads: "Кезектегі жүктеулер",
	downloads_completed: "Аяқталды",
	queued: "Кезекте",
	no_downloads_title: "Мұнда бос...",
	no_downloads_description: "Сіз Hydra арқылы әлі ештеңе жүктемегенсіз, бірақ бастау ешқашан кеш емес."
};
const settings = {
	downloads_path: "Жүктеу жолы",
	change: "Өзгерту",
	notifications: "Хабарламалар",
	enable_download_notifications: "Жүктеу аяқталғанда",
	enable_repack_list_notifications: "Жаңа репак қосылғанда",
	real_debrid_api_token_label: "Real-Debrid API-токен",
	quit_app_instead_hiding: "Hydra-ны трейге жасырудың орнына жабу",
	launch_with_system: "Жүйемен бірге Hydra-ны іске қосу",
	general: "Жалпы",
	behavior: "Мінез-құлық",
	download_sources: "Жүктеу көздері",
	language: "Тіл",
	real_debrid_api_token: "API Кілті",
	enable_real_debrid: "Real-Debrid-ті қосу",
	real_debrid_description: "Real-Debrid - бұл шектеусіз жүктеуші, ол интернетте орналастырылған файлдарды тез жүктеуге немесе жеке желі арқылы кез келген блоктарды айналып өтіп, оларды бірден плеерге беруге мүмкіндік береді.",
	real_debrid_invalid_token: "Қате API кілті",
	real_debrid_api_token_hint: "API кілтін <0>осы жерден</0> алуға болады",
	real_debrid_free_account_error: "\"{{username}}\" аккаунты жазылымға ие емес. Real-Debrid жазылымын алыңыз",
	real_debrid_linked_message: "\"{{username}}\" аккаунты байланған",
	save_changes: "Өзгерістерді сақтау",
	changes_saved: "Өзгерістер сәтті сақталды",
	download_sources_description: "Hydra осы көздерден жүктеу сілтемелерін алады. URL-да жүктеу сілтемелері бар .json файлына тікелей сілтеме болуы керек.",
	validate_download_source: "Тексеру",
	remove_download_source: "Жою",
	add_download_source: "Жүктеу көзін қосу",
	download_count_zero: "Жүктеулер тізімінде жоқ",
	download_count_one: "{{countFormatted}} жүктеу тізімде",
	download_count_other: "{{countFormatted}} жүктеу тізімде",
	download_options_zero: "Қолжетімді жүктеулер жоқ",
	download_options_one: "{{countFormatted}} жүктеу нұсқасы қол жетімді",
	download_options_other: "{{countFormatted}} жүктеу нұсқалары қол жетімді",
	download_source_url: "Көздің сілтемесі",
	add_download_source_description: ".json файлға сілтемені қойыңыз",
	download_source_up_to_date: "Жаңартылған",
	download_source_errored: "Қате",
	sync_download_sources: "Көздерді синхрондау",
	removed_download_source: "Жүктеу көзі жойылды",
	added_download_source: "Жүктеу көзі қосылды",
	download_sources_synced: "Барлық жүктеу көздері синхрондалды",
	insert_valid_json_url: "Жарамды JSON URL енгізіңіз",
	found_download_option_zero: "Жүктеу нұсқалары табылмады",
	found_download_option_one: "{{countFormatted}} жүктеу нұсқасы табылды",
	found_download_option_other: "{{countFormatted}} жүктеу нұсқалары табылды",
	"import": "Импорттау"
};
const notifications = {
	download_complete: "Жүктеу аяқталды",
	game_ready_to_install: "{{title}} орнатуға дайын",
	repack_list_updated: "Репактар тізімі жаңартылды",
	repack_count_one: "{{count}} репак қосылды",
	repack_count_other: "{{count}} репактар қосылды"
};
const system_tray = {
	open: "Hydra-ны ашу",
	quit: "Шығу"
};
const game_card = {
	no_downloads: "Жүктеулер жоқ"
};
const binary_not_found_modal = {
	title: "Бағдарламалар орнатылмаған",
	description: "Wine немесе Lutris табылмады",
	instructions: "Linux дистрибутивіңізге олардың кез келгенін дұрыс орнатудың жолын біліңіз осылайша ойын дұрыс жұмыс істей алады"
};
const modal = {
	close: "Жабу"
};
const forms = {
	toggle_password_visibility: "Құпиясөзді көрсету"
};
const user_profile = {
	amount_hours: "{{amount}} сағат",
	amount_minutes: "{{amount}} минут",
	last_time_played: "Соңғы ойын {{period}}",
	activity: "Соңғы әрекет",
	library: "Кітапхана",
	total_play_time: "Барлығы ойнаған: {{amount}}",
	no_recent_activity_title: "Хммм... Мұнда ештеңе жоқ",
	no_recent_activity_description: "Сіз ұзақ уақыт бойы ештеңе ойнаған жоқсыз. Мұны өзгерту керек!",
	display_name: "Көрсету аты",
	saving: "Сақтау",
	save: "Сақталды",
	edit_profile: "Профильді өзгерту",
	saved_successfully: "Сәтті сақталды",
	try_again: "Қайта көріңіз",
	sign_out_modal_title: "Сіз сенімдісіз бе?",
	cancel: "Болдырмау",
	successfully_signed_out: "Аккаунттан сәтті шығу",
	sign_out: "Шығу",
	playing_for: "Ойнаған {{amount}}",
	sign_out_modal_text: "Сіздің кітапханаңыз ағымдағы аккаунтпен байланысты. Жүйеден шыққанда сіздің кітапханаңыз қол жетімсіз болады және прогресс сақталмайды. Шығу?"
};
const translation = {
	app: app,
	home: home,
	sidebar: sidebar,
	header: header,
	bottom_panel: bottom_panel,
	catalogue: catalogue,
	game_details: game_details,
	activation: activation,
	downloads: downloads,
	settings: settings,
	notifications: notifications,
	system_tray: system_tray,
	game_card: game_card,
	binary_not_found_modal: binary_not_found_modal,
	modal: modal,
	forms: forms,
	user_profile: user_profile
};

const resources = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  ar: translation$4,
  be: translation$a,
  ca: translation$1,
  da: translation$5,
  en: translation$k,
  es: translation$i,
  fa: translation$3,
  fr: translation$g,
  hu: translation$f,
  id: translation$7,
  it: translation$e,
  kk: translation,
  ko: translation$6,
  nl: translation$h,
  pl: translation$d,
  pt: translation$j,
  ro: translation$2,
  ru: translation$c,
  tr: translation$b,
  uk: translation$9,
  zh: translation$8
}, Symbol.toStringTag, { value: 'Module' }));

var define_import_meta_env_default = { BASE_URL: "/", MODE: "development", DEV: true, PROD: false, SSR: true };
const { autoUpdater } = updater;
autoUpdater.setFeedURL({
  provider: "github",
  owner: "hydralauncher",
  repo: "hydra"
});
autoUpdater.logger = logger;
const gotTheLock = app$7.requestSingleInstanceLock();
if (!gotTheLock)
  app$7.quit();
if (define_import_meta_env_default.MAIN_VITE_SENTRY_DSN) {
  init({
    dsn: define_import_meta_env_default.MAIN_VITE_SENTRY_DSN
  });
}
app$7.commandLine.appendSwitch("--no-sandbox");
i18n.init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});
const PROTOCOL = "hydralauncher";
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app$7.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [
      path.resolve(process.argv[1])
    ]);
  }
} else {
  app$7.setAsDefaultProtocolClient(PROTOCOL);
}
app$7.whenReady().then(async () => {
  electronApp.setAppUserModelId("site.hydralauncher.hydra");
  protocol.handle("local", (request) => {
    const filePath = request.url.slice("local:".length);
    return net.fetch(url$1.pathToFileURL(decodeURI(filePath)).toString());
  });
  await dataSource.initialize();
  await dataSource.runMigrations();
  await import('./main-DXgGqmXm.js').then(n => n.m);
  const userPreferences = await userPreferencesRepository.findOne({
    where: {
      id: 1
    }
  });
  if (userPreferences?.language) {
    i18n.changeLanguage(userPreferences.language);
  }
  WindowManager.createMainWindow();
  WindowManager.createSystemTray(userPreferences?.language || "en");
});
app$7.on("browser-window-created", (_, window) => {
  optimizer.watchWindowShortcuts(window);
});
const handleDeepLinkPath = (uri) => {
  if (!uri)
    return;
  const url2 = new URL(uri);
  if (url2.host === "install-source") {
    WindowManager.redirect(`settings${url2.search}`);
  }
};
app$7.on("second-instance", (_event, commandLine) => {
  if (WindowManager.mainWindow) {
    if (WindowManager.mainWindow.isMinimized())
      WindowManager.mainWindow.restore();
    WindowManager.mainWindow.focus();
  } else {
    WindowManager.createMainWindow();
  }
  handleDeepLinkPath(commandLine.pop());
});
app$7.on("open-url", (_event, url2) => {
  handleDeepLinkPath(url2);
});
app$7.on("window-all-closed", () => {
  WindowManager.mainWindow = null;
});
app$7.on("before-quit", () => {
  PythonInstance.kill();
});
app$7.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    WindowManager.createMainWindow();
  }
});

export { DownloadSource as D, Game$1 as G, HydraApi as H, PythonInstance as P, RepacksManager as R, UserAuth as U, WindowManager as W, downloadSourceWorker as a, dataSource as b, Repack as c, downloadSourceRepository as d, HttpDownload as e, calculateETA as f, gameRepository as g, downloadQueueRepository as h, uploadGamesBatch as i, requestWebPage as j, requestSteam250 as k, logger as l, getSteamAppAsset as m, gameShopCacheRepository as n, steamGamesWorker as o, getSteam250List as p, getFileBase64 as q, repackRepository as r, sleep as s, trayIcon as t, userPreferencesRepository as u, defaultDownloadsPath as v, DownloadQueue$1 as w, userAuthRepository as x };
//# sourceMappingURL=index.js.map
