"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/Datastores.ts
const run_1 = require("./lib/run");
exports.getCluster = async (ps) => {
    const res = await run_1.run(ps, 'Get-Cluster | Select Name  | ConvertTo-Json');
    return JSON.parse(res);
};
