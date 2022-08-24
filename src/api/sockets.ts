/**
 * @author Cian Ormond <co@cianormond.com>
 */

import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { activeUsers, sectorData } from "../index";
import { canFlagTimeout, flagTimeout } from "./sectorTimeout";
import { SharedAircraftDto } from "../types/sharedAircraftDto";
import { SharedSectorData } from "../types/sharedSectorData";
import { SharedAclState } from "../types/sharedAclState";
import { SharedDepState } from "../types/sharedDepState";
import { SharedGpdState } from "../types/sharedGpdState";
import { SharedPlansDisplayState } from "../types/sharedPlansDisplayState";
import { SharedUiState } from "../types/sharedUiState";
import _ from "lodash";
import { EdstWindow } from "../enums/edstWindow";
import { Plan } from "../types/plan";
import { AclSortOption } from "../enums/aclSortOption";
import { DepSortOption } from "../enums/depSortOption";

interface ClientToServerEvents {
    updateAircraft: (sectorId: string, payload: SharedAircraftDto) => void;
    setAclSort: (sortOption: AclSortOption, sector: boolean) => void;
    setAclManualPosting: (value: boolean) => void;
    setDepManualPosting: (value: boolean) => void;
    setDepSort: (sortOption: DepSortOption) => void;
    setPlanQueue: (value: Plan[]) => void;
    setWindowIsOpen: (window: EdstWindow, value: boolean) => void;
    clearPlanQueue: () => void;
}

interface ServerToClientEvents {
    receiveAircraft: (aircraft: SharedAircraftDto) => void
    receiveAclState: (value: SharedAclState) => void;
    receiveDepState: (value: SharedDepState) => void;
    receiveGpdState: (value: SharedGpdState) => void
    receivePlansDisplayState: (value: SharedPlansDisplayState) => void;
    receiveBringWindowToFront: (window: EdstWindow) => void;
    receiveUiState: (value: SharedUiState) => void;
}

export default function(server: HttpServer) {

    const io = new Server(server, {
        cors: {
            origin: process.env.corsOrigin,
        }
    });
    io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {

        const sectorId = socket.handshake.query.sectorId;

        if (socket.handshake.auth?.token !== process.env.authToken || !(typeof sectorId === "string")) {
            socket.disconnect();
        }

        const userInfo = {
            id: socket.id,
            sectorId: sectorId as string
        };

        if (!sectorData[userInfo.sectorId]) {
            sectorData[userInfo.sectorId] = new SharedSectorData(userInfo.sectorId);
        } else {
            Object.values(sectorData[userInfo.sectorId].aircraftData).forEach(aircraft => socket.emit("receiveAircraft", aircraft));
            socket.emit("receiveUiState", sectorData[userInfo.sectorId].uiState);
        }

        socket.join(userInfo.sectorId);

        function emitAircraftToRoom(aircraftId: string) {
            io.to(userInfo.sectorId).emit("receiveAircraft", sectorData[userInfo.sectorId].aircraftData[aircraftId]);
        }

        socket.on('updateAircraft', (sectorId, payload) => {
            sectorData[sectorId].timeModified = Date.now();
            const aircraft = new SharedAircraftDto(payload);
            if (!_.isEqual(sectorData[userInfo.sectorId].aircraftData[aircraft.aircraftId], aircraft)) {
                sectorData[userInfo.sectorId].aircraftData[aircraft.aircraftId] = aircraft;
                emitAircraftToRoom(aircraft.aircraftId);
            }
        });

        socket.on('setAclSort', (selectedOption, sector) => {
            if (sectorData[userInfo.sectorId].uiState.acl.sortOption !== selectedOption || sectorData[userInfo.sectorId].uiState.acl.sortSector !== sector) {
                sectorData[userInfo.sectorId].uiState.acl.sortOption = selectedOption;
                sectorData[userInfo.sectorId].uiState.acl.sortSector = sector;
                io.to(userInfo.sectorId).emit('receiveAclState', sectorData[userInfo.sectorId].uiState.acl);
            }
        })

        socket.on('setDepSort', (selectedOption) => {
            if (sectorData[userInfo.sectorId].uiState.dep.sortOption !== selectedOption) {
                sectorData[userInfo.sectorId].uiState.dep.sortOption = selectedOption;
                io.to(userInfo.sectorId).emit('receiveDepState', sectorData[userInfo.sectorId].uiState.dep);
            }
        })

        socket.on('setPlanQueue', (queue) => {
            if (!_.isEqual(sectorData[userInfo.sectorId].uiState.plansDisplay.planQueue, queue)) {
                sectorData[userInfo.sectorId].uiState.plansDisplay.planQueue = queue;
                io.to(userInfo.sectorId).emit('receivePlansDisplayState', sectorData[userInfo.sectorId].uiState.plansDisplay);
            }
        })

        socket.on('setWindowIsOpen', (window, value) => {
            switch(window) {
                case EdstWindow.ACL:
                    if (sectorData[userInfo.sectorId].uiState.acl.open !== value) {
                        sectorData[userInfo.sectorId].uiState.acl.open = value;
                        io.to(userInfo.sectorId).emit("receiveAclState", sectorData[userInfo.sectorId].uiState.acl);
                    } else {
                        io.to(userInfo.sectorId).emit("receiveBringWindowToFront", window);
                    }
                    break;
                case EdstWindow.DEP:
                    if (sectorData[userInfo.sectorId].uiState.dep.open !== value) {
                        sectorData[userInfo.sectorId].uiState.dep.open = value;
                        io.to(userInfo.sectorId).emit("receiveDepState", sectorData[userInfo.sectorId].uiState.dep);
                    } else {
                        io.to(userInfo.sectorId).emit("receiveBringWindowToFront", window);
                    }
                    break;
                case EdstWindow.GPD:
                    if (sectorData[userInfo.sectorId].uiState.gpd.open !== value) {
                        sectorData[userInfo.sectorId].uiState.gpd.open = value;
                        io.to(userInfo.sectorId).emit("receiveGpdState", sectorData[userInfo.sectorId].uiState.gpd);
                    } else {
                        io.to(userInfo.sectorId).emit("receiveBringWindowToFront", window);
                    }
                    break;
                case EdstWindow.PLANS_DISPLAY:
                    if (sectorData[userInfo.sectorId].uiState.plansDisplay.open !== value) {
                        sectorData[userInfo.sectorId].uiState.plansDisplay.open = value;
                        io.to(userInfo.sectorId).emit("receivePlansDisplayState", sectorData[userInfo.sectorId].uiState.plansDisplay);
                    } else {
                        io.to(userInfo.sectorId).emit("receiveBringWindowToFront", window);
                    }
                    break;
                default: break;
            }
        })

        socket.on('clearPlanQueue', () => {
            sectorData[userInfo.sectorId].uiState.plansDisplay = new SharedPlansDisplayState();
            io.to(userInfo.sectorId).emit("receivePlansDisplayState", sectorData[userInfo.sectorId].uiState.plansDisplay);
        })

        socket.on('setAclManualPosting', (value) => {
            if (sectorData[userInfo.sectorId].uiState.acl.manualPosting !== value) {
                sectorData[userInfo.sectorId].uiState.acl.manualPosting = value;
                io.to(userInfo.sectorId).emit("receiveAclState", sectorData[userInfo.sectorId].uiState.acl);
            }
        })

        socket.on('setDepManualPosting', (value) => {
            if (sectorData[userInfo.sectorId].uiState.dep.manualPosting !== value) {
                sectorData[userInfo.sectorId].uiState.dep.manualPosting = value;
                io.to(userInfo.sectorId).emit("receiveDepState", sectorData[userInfo.sectorId].uiState.dep);
            }
        })

        socket.on('disconnect', () => {
            if (sectorData[userInfo.sectorId]) {
                sectorData[userInfo.sectorId].timeModified = Date.now();
                if (canFlagTimeout(userInfo.sectorId)) {
                    flagTimeout(userInfo.sectorId);
                }
            }
            activeUsers.delete(userInfo.id);
        });
    });
}
