"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/VMs.ts
const run_1 = require("./lib/run");
exports.getVMs = async (ps) => {
    const res = await run_1.run(ps, 'Get-VM  | Select PowerState, NumCpu, HardDisks, MemoryMB, ProvisionedSpaceGB, UsedSpaceGB | ConvertTo-Json');
    return JSON.parse(res);
};
