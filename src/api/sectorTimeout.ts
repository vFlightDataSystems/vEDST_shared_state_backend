/**
 * @author Cian Ormond <co@cianormond.com>
 */

import {activeUsers, getSectorIndex, sectors} from "../index";

export let intervals: Map<string, NodeJS.Timer> = new Map<string, NodeJS.Timer>();

/**
 * Checks if sector is ready to be flagged for timeout
 * @param sector Sector to flag for timeout
 * @returns
 */
export function canFlagTimeout(sector: string): boolean {
    return !activeUsers.has(sector);
}

/**
 * Starts countdown to remove sector after 30 mins
 * @param sector Sector to flag for timeout
 */
export function flagTimeout(sector: string) {
    sectors[getSectorIndex(sector)].timeoutFlagged = true;
    intervals.set(sector, setInterval(() => checkTimeoutCountdown(sector), 6000));
}

/**
 * Checks if sector should be removed, disflagged or left as is
 * @param sector Sector to check for timeout
 */
function checkTimeoutCountdown(sector: string) {
    const sectorIndex = getSectorIndex(sector);
    const interval = intervals.get(sector);

    if (!sectors[sectorIndex].timeoutFlagged) {
        clearInterval(interval);
        return;
    }

    if (activeUsers.has(sector)) {
        clearInterval(interval);
        return;
    }

    const timeModified = sectors[sectorIndex].timeModified;
    if (Date.now() < timeModified + 5) return;
    else {
        if (interval != undefined)
            timeout(sectorIndex, interval);
    }
}

/**
 * Removes sector
 * @param sectorIndex Index of sector to remove
 * @param interval ID of interval
 */
function timeout(sectorIndex: number, interval: NodeJS.Timer) {
    clearInterval(interval);
    sectors.splice(sectorIndex, sectorIndex + 1);
}