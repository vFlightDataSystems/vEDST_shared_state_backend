/**
 * @author Cian Ormond <co@cianormond.com>
 */

import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { flagTimeout, intervals } from "./sectorTimeout";
import { SharedAircraftDto } from "../typeDefinitions/types/sharedAircraftDto";
import { SharedSectorData } from "../typeDefinitions/types/sharedSectorData";
import { SharedAclState } from "../typeDefinitions/types/sharedAclState";
import { SharedDepState } from "../typeDefinitions/types/sharedDepState";
import { SharedGpdState } from "../typeDefinitions/types/sharedGpdState";
import { SharedPlansDisplayState } from "../typeDefinitions/types/sharedPlansDisplayState";
import { SharedUiState } from "../typeDefinitions/types/sharedUiState";
import _ from "lodash";
import { EdstWindow } from "../typeDefinitions/enums/edstWindow";
import { Plan } from "../typeDefinitions/types/plan";
import { AclSortOption } from "../typeDefinitions/enums/aclSortOption";
import { DepSortOption } from "../typeDefinitions/enums/depSortOption";
import { sectorData } from "../index";
import { Asel } from "../typeDefinitions/types/asel";

interface ClientToServerEvents {
    updateAircraft: (sectorId: string, payload: SharedAircraftDto) => void;
    setAclSort: (sortOption: AclSortOption, sector: boolean) => void;
    setAclManualPosting: (value: boolean) => void;
    setDepManualPosting: (value: boolean) => void;
    setDepSort: (sortOption: DepSortOption) => void;
    setPlanQueue: (value: Plan[]) => void;
    setWindowIsOpen: (window: EdstWindow, value: boolean) => void;
    setAircraftSelect: (asel: Asel | null, eventId: string | null) => void;
    clearPlanQueue: () => void;
}

interface ServerToClientEvents {
    receiveAircraft: (aircraft: SharedAircraftDto) => void
    receiveAclState: (value: SharedAclState) => void;
    receiveDepState: (value: SharedDepState) => void;
    receiveGpdState: (value: SharedGpdState) => void
    receivePlansDisplayState: (value: SharedPlansDisplayState) => void;
    receiveBringWindowToFront: (window: EdstWindow) => void;
    receiveAircraftSelect: (asel: Asel | null, eventId: string | null) => void;
    receiveUiState: (value: SharedUiState) => void;
}

export default function(server: HttpServer) {

    const io = new Server(server, {
        cors: {
            origin: process.env.corsOrigin,
        }
    });

    io.of("/").adapter.on("create-room", (room) => {
        if (room.length < 6) {
            sectorData[room] = new SharedSectorData(room);
            const interval = intervals.get(room);
            if (interval) {
                clearInterval(interval);
            }
            console.log(`room ${room} was created`);
        }
    });

    io.of("/").adapter.on("delete-room", (room) => {
        if (sectorData[room]) {
            flagTimeout(room);
        }
        console.log(`room ${room} was deleted`);
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

        socket.join(userInfo.sectorId);

        if (!sectorData[userInfo.sectorId]) {
            sectorData[userInfo.sectorId] = new SharedSectorData(userInfo.sectorId);
        } else {
            Object.values(sectorData[userInfo.sectorId].aircraftData).forEach(aircraft => socket.emit("receiveAircraft", aircraft));
            socket.emit("receiveUiState", sectorData[userInfo.sectorId].uiState);
        }

        function emitAircraftToRoom(aircraftId: string) {
            socket.to(userInfo.sectorId).emit("receiveAircraft", sectorData[userInfo.sectorId].aircraftData[aircraftId]);
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
                socket.to(userInfo.sectorId).emit('receiveAclState', sectorData[userInfo.sectorId].uiState.acl);
            }
        })

        socket.on('setDepSort', (selectedOption) => {
            if (sectorData[userInfo.sectorId].uiState.dep.sortOption !== selectedOption) {
                sectorData[userInfo.sectorId].uiState.dep.sortOption = selectedOption;
                socket.to(userInfo.sectorId).emit('receiveDepState', sectorData[userInfo.sectorId].uiState.dep);
            }
        })

        socket.on('setPlanQueue', (queue) => {
            if (!_.isEqual(sectorData[userInfo.sectorId].uiState.plansDisplay.planQueue, queue)) {
                sectorData[userInfo.sectorId].uiState.plansDisplay.planQueue = queue;
                socket.to(userInfo.sectorId).emit('receivePlansDisplayState', sectorData[userInfo.sectorId].uiState.plansDisplay);
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

        socket.on('setAircraftSelect', (asel, eventId) => {
            if (sectorData[userInfo.sectorId].uiState.asel !== asel) {
                sectorData[userInfo.sectorId].uiState.asel = asel;
                socket.to(userInfo.sectorId).emit("receiveAircraftSelect", asel, eventId);
            }
        })

        socket.on('clearPlanQueue', () => {
            sectorData[userInfo.sectorId].uiState.plansDisplay = new SharedPlansDisplayState();
            socket.to(userInfo.sectorId).emit("receivePlansDisplayState", sectorData[userInfo.sectorId].uiState.plansDisplay);
        })

        socket.on('setAclManualPosting', (value) => {
            if (!_.isEqual(sectorData[userInfo.sectorId].uiState.acl.manualPosting, value)) {
                sectorData[userInfo.sectorId].uiState.acl.manualPosting = value;
                socket.to(userInfo.sectorId).emit("receiveAclState", sectorData[userInfo.sectorId].uiState.acl);
            }
        })

        socket.on('setDepManualPosting', (value) => {
            if (sectorData[userInfo.sectorId].uiState.dep.manualPosting !== value) {
                sectorData[userInfo.sectorId].uiState.dep.manualPosting = value;
                socket.to(userInfo.sectorId).emit("receiveDepState", sectorData[userInfo.sectorId].uiState.dep);
            }
        })
    });
}
