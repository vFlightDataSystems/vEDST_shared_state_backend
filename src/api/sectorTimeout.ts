/**
 * @author Cian Ormond <co@cianormond.com>
 */

import {activeUsers, sectors} from "../index";

export let intervals: Map<string, NodeJS.Timer> = new Map<string, NodeJS.Timer>();

/**
 * Checks if sectorId is ready to be flagged for timeout
 * @param sectorId Sector to flag for timeout
 * @returns
 */
export function canFlagTimeout(sectorId: string): boolean {
    return !activeUsers.has(sectorId);
}

/**
 * Starts countdown to remove sectorId after 30 mins
 * @param sectorId Sector to flag for timeout
 */
export function flagTimeout(sectorId: string) {
    sectors[sectorId].timeoutFlagged = true;
    intervals.set(sectorId, setInterval(() => checkTimeoutCountdown(sectorId), 6000));
}

/**
 * Checks if sectorId should be removed, isflagged or left as is
 * @param sectorId Sector to check for timeout
 */
function checkTimeoutCountdown(sectorId: string) {
    const interval = intervals.get(sectorId);

    if (!sectors[sectorId]?.timeoutFlagged) {
        clearInterval(interval);
        return;
    }

    if (activeUsers.has(sectorId)) {
        clearInterval(interval);
        return;
    }

    const timeModified = sectors[sectorId].timeModified;
    if (Date.now() < timeModified + 1800) return;
    else {
        if (interval != undefined)
            timeout(sectorId, interval);
    }
}

/**
 * Removes sectorId
 * @param sectorId sectorId to remove
 * @param interval ID of interval
 */
function timeout(sectorId: string, interval: NodeJS.Timer) {
    clearInterval(interval);
    delete sectors[sectorId];
}