"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Add and exec a PowerShell command
 * @param ps node-PowerShell Instance
 * @param command Powershell Command to exec
 */
exports.run = async (ps, command) => {
    // Add command to PowerShell Que
    await ps.addCommand(command);
    // Return the promise of invoking the command.
    return ps.invoke();
};
