;!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="d423623a-36b8-4376-9360-d5fc393a81eb",e._sentryDebugIdIdentifier="sentry-dbid-d423623a-36b8-4376-9360-d5fc393a81eb")}catch(e){}}();import { orderBy, slice } from 'lodash-es';
import flexSearch from 'flexsearch';
import fs from 'node:fs';
import { f as formatName } from './index-0S7GjpUn.js';
import { workerData } from 'node:worker_threads';

const steamGamesIndex = new flexSearch.Index({
    tokenize: "reverse"
});
const { steamGamesPath } = workerData;
const data = fs.readFileSync(steamGamesPath, "utf-8");
const steamGames = JSON.parse(data);
for(let i = 0; i < steamGames.length; i++){
    const steamGame = steamGames[i];
    const formattedName = formatName(steamGame.name);
    steamGamesIndex.add(i, formattedName);
}
const search = (options)=>{
    const results = steamGamesIndex.search(options);
    const games = results.map((index)=>steamGames[index]);
    return orderBy(games, [
        "name"
    ], [
        "asc"
    ]);
};
const getById = (id)=>steamGames.find((game)=>game.id === id);
const list = ({ limit, offset })=>slice(steamGames, offset, offset + limit);

export { getById, list, search };
//# sourceMappingURL=steam-games.worker-DXB1vbxe.js.map
