/**
 * @author Cian Ormond <co@cianormond.com>
 */

import {activeUsers, sectors} from "../index";

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
    sectors[sector].timeoutFlagged = true;
    intervals.set(sector, setInterval(() => checkTimeoutCountdown(sector), 6000));
}

/**
 * Checks if sector should be removed, isflagged or left as is
 * @param sector Sector to check for timeout
 */
function checkTimeoutCountdown(sector: string) {
    const interval = intervals.get(sector);

    if (!sectors[sector].timeoutFlagged) {
        clearInterval(interval);
        return;
    }

    if (activeUsers.has(sector)) {
        clearInterval(interval);
        return;
    }

    const timeModified = sectors[sector].timeModified;
    if (Date.now() < timeModified + 1800) return;
    else {
        if (interval != undefined)
            timeout(sector, interval);
    }
}

/**
 * Removes sector
 * @param sector sector to remove
 * @param interval ID of interval
 */
function timeout(sector: string, interval: NodeJS.Timer) {
    clearInterval(interval);
    delete sectors[sector];
}