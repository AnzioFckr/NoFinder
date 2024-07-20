;!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b994eee4-4fcf-41ab-bf01-e39ffb9c95f5",e._sentryDebugIdIdentifier="sentry-dbid-b994eee4-4fcf-41ab-bf01-e39ffb9c95f5")}catch(e){}}();import { z } from 'zod';

const downloadSourceSchema = z.object({
    name: z.string().max(255),
    downloads: z.array(z.object({
        title: z.string().max(255),
        uris: z.array(z.string()),
        uploadDate: z.string().max(255),
        fileSize: z.string().max(255)
    }))
});

export { downloadSourceSchema as d };
//# sourceMappingURL=validators-BGrj6pz9.js.map
