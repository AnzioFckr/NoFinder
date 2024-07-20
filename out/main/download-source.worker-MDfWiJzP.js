;!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5886154d-0de0-4917-bda6-2f8783d5dca9",e._sentryDebugIdIdentifier="sentry-dbid-5886154d-0de0-4917-bda6-2f8783d5dca9")}catch(e){}}();import { d as downloadSourceSchema } from './validators-BGrj6pz9.js';
import { D as DownloadSourceStatus } from './index-0S7GjpUn.js';
import axios, { AxiosHeaders } from 'axios';

const getUpdatedRepacks = async (downloadSources)=>{
    const results = [];
    for (const downloadSource of downloadSources){
        const headers = new AxiosHeaders();
        if (downloadSource.etag) {
            headers.set("If-None-Match", downloadSource.etag);
        }
        try {
            const response = await axios.get(downloadSource.url, {
                headers
            });
            const source = downloadSourceSchema.parse(response.data);
            results.push({
                ...downloadSource,
                downloads: source.downloads,
                etag: response.headers["etag"],
                status: DownloadSourceStatus.UpToDate
            });
        } catch (err) {
            const isNotModified = err.response?.status === 304;
            results.push({
                ...downloadSource,
                downloads: [],
                etag: null,
                status: isNotModified ? DownloadSourceStatus.UpToDate : DownloadSourceStatus.Errored
            });
        }
    }
    return results;
};
const validateDownloadSource = async ({ url, repacks })=>{
    const response = await axios.get(url);
    const source = downloadSourceSchema.parse(response.data);
    const existingUris = source.downloads.flatMap((download)=>download.uris).filter((uri)=>repacks.some((repack)=>repack.magnet === uri));
    return {
        name: source.name,
        downloadCount: source.downloads.length - existingUris.length
    };
};

export { getUpdatedRepacks, validateDownloadSource };
//# sourceMappingURL=download-source.worker-MDfWiJzP.js.map
