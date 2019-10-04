"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/Datastores.ts
const run_1 = require("./lib/run");
exports.getDatastores = async (ps) => {
    const res = await run_1.run(ps, 'Get-Datastore | Select Name,FreeSpaceGB,CapacityGB  | ConvertTo-Json');
    return JSON.parse(res);
};
