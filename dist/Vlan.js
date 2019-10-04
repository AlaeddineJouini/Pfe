"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/VMs.ts
const run_1 = require("./lib/run");
let name = 'testFirst'
let vs = 'vSwitch1'
let vid= 100


exports.getVlan = async (ps) => {
    const res = await run_1.run(ps, `New-VirtualPortGroup -Name ${name} -VirtualSwitch ${vs} -VLanId ${vid} `);
    return JSON.parse(res);
};
