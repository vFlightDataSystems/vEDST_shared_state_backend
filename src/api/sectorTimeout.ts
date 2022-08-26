/**
 * @author Cian Ormond <co@cianormond.com>
 */

import {sectorData} from "../index";

export const intervals = new Map<string, NodeJS.Timer>();

/**
 * Starts countdown to remove sectorId after 30 mins
 * @param sectorId Sector to flag for timeout
 */
export function flagTimeout(sectorId: string) {
    sectorData[sectorId].timeoutFlagged = true;
    intervals.set(sectorId, setInterval(() => checkTimeoutCountdown(sectorId), 6000));
}

/**
 * Checks if sectorId should be removed, isflagged or left as is
 * @param sectorId Sector to check for timeout
 */
function checkTimeoutCountdown(sectorId: string) {
    const interval = intervals.get(sectorId);

    if (!sectorData[sectorId]?.timeoutFlagged) {
        clearInterval(interval);
        return;
    }

    const timeModified = sectorData[sectorId].timeModified;
    if (Date.now() > timeModified + 1800 * 1000 && interval !== undefined)  {
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
    delete sectorData[sectorId];
}