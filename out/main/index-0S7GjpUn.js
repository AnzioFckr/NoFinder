;!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="d2923a48-28d4-43c8-bcc6-6e4d7cbc463e",e._sentryDebugIdIdentifier="sentry-dbid-d2923a48-28d4-43c8-bcc6-6e4d7cbc463e")}catch(e){}}();var Downloader;
(function(Downloader) {
    Downloader[Downloader["RealDebrid"] = 0] = "RealDebrid";
    Downloader[Downloader["Torrent"] = 1] = "Torrent";
})(Downloader || (Downloader = {}));
var DownloadSourceStatus;
(function(DownloadSourceStatus) {
    DownloadSourceStatus[DownloadSourceStatus["UpToDate"] = 0] = "UpToDate";
    DownloadSourceStatus[DownloadSourceStatus["Errored"] = 1] = "Errored";
})(DownloadSourceStatus || (DownloadSourceStatus = {}));
class UserNotLoggedInError extends Error {
    constructor(){
        super("user not logged in");
        this.name = "UserNotLoggedInError";
    }
}
const pipe = (...fns)=>(arg)=>fns.reduce((prev, fn)=>fn(prev), arg);
const removeReleaseYearFromName = (name)=>name.replace(/\([0-9]{4}\)/g, "");
const removeSymbolsFromName = (name)=>name.replace(/[^A-Za-z 0-9]/g, "");
const removeSpecialEditionFromName = (name)=>name.replace(/(The |Digital )?(GOTY|Deluxe|Standard|Ultimate|Definitive|Enhanced|Collector's|Premium|Digital|Limited|Game of the Year|Reloaded|[0-9]{4}) Edition/g, "");
const removeDuplicateSpaces = (name)=>name.replace(/\s{2,}/g, " ");
const replaceUnderscoreWithSpace = (name)=>name.replace(/_/g, " ");
const formatName = pipe(removeReleaseYearFromName, removeSpecialEditionFromName, replaceUnderscoreWithSpace, (str)=>str.replace(/DIRECTOR'S CUT/g, ""), removeSymbolsFromName, removeDuplicateSpaces, (str)=>str.trim());

export { DownloadSourceStatus as D, UserNotLoggedInError as U, Downloader as a, formatName as f, removeSymbolsFromName as r };
//# sourceMappingURL=index-0S7GjpUn.js.map
