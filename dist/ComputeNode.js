"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/Datastores.ts
const run_1 = require("./lib/run");
exports.getComputes = async (ps) => {
    const res = await run_1.run(ps, 'Get-VMHost | Select Name,NumCpu,CpuUsageMhz,CpuTotalMhz,MemoryUsageGB,MemoryTotalGB  | ConvertTo-Json');
    return JSON.parse(res);
};
    