/**
 * @author Cian Ormond <co@cianormond.com>
 */

import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { flagTimeout, intervals } from "./sectorTimeout";
import { SharedAircraftDto } from "../typeDefinitions/types/sharedAircraftDto";
import { SharedSectorData } from "../typeDefinitions/types/sharedSectorData";
import { SharedUiState } from "../typeDefinitions/types/sharedUiState";
import _ from "lodash";
import { EdstWindow } from "../typeDefinitions/enums/edstWindow";
import { sectorData } from "../index";
import { Asel } from "../typeDefinitions/types/asel";
import { AclState } from "../typeDefinitions/types/aclState";
import { DepState } from "../typeDefinitions/types/depState";
import { PlanState } from "../typeDefinitions/types/planState";
import { GpdState } from "../typeDefinitions/types/gpdState";

interface ClientToServerEvents {
    updateAircraft: (sectorId: string, payload: SharedAircraftDto) => void;
    setAclState: (value: AclState) => void;
    setDepState: (value: DepState) => void;
    setGpdState: (value: GpdState) => void;
    setPlanState: (value: PlanState) => void;
    setAircraftSelect: (asel: Asel | null, eventId: string | null) => void;
    openWindow: (window: EdstWindow) => void
    closeWindow: (window: EdstWindow) => void
    clearPlanQueue: () => void;
    dispatchUiEvent: (eventId: string) => void;
}

interface ServerToClientEvents {
    receiveAircraft: (aircraft: SharedAircraftDto) => void;
    receiveAclState: (value: AclState) => void;
    receiveDepState: (value: DepState) => void;
    receiveGpdState: (value: GpdState) => void;
    receivePlansDisplayState: (value: PlanState) => void;
    receiveOpenWindow: (window: EdstWindow) => void;
    receiveCloseWindow: (window: EdstWindow) => void;
    receiveAircraftSelect: (asel: Asel | null, eventId: string | null) => void;
    receiveUiState: (value: SharedUiState) => void;
    receiveUiEvent: (eventId: string) => void;
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

        socket.on('setAclState', (value) => {
            if (!_.isEqual(sectorData[userInfo.sectorId].uiState.acl, value)) {
                sectorData[userInfo.sectorId].uiState.acl = value;
                socket.to(userInfo.sectorId).emit("receiveAclState", value);
            }
        })

        socket.on('setDepState', (value) => {
            if (!_.isEqual(sectorData[userInfo.sectorId].uiState.acl, value)) {
                sectorData[userInfo.sectorId].uiState.dep = value;
                socket.to(userInfo.sectorId).emit("receiveDepState", value);
            }
        })

        socket.on('setGpdState', (value) => {
            if (!_.isEqual(sectorData[userInfo.sectorId].uiState.acl, value)) {
                sectorData[userInfo.sectorId].uiState.gpd = value;
                socket.to(userInfo.sectorId).emit("receiveGpdState", value);
            }
        })

        socket.on('setPlanState', (value) => {
            if (!_.isEqual(sectorData[userInfo.sectorId].uiState.acl, value)) {
                sectorData[userInfo.sectorId].uiState.plansDisplay = value;
                socket.to(userInfo.sectorId).emit("receivePlansDisplayState", value);
            }
        })

        socket.on('openWindow', (window) => {
            const index = sectorData[userInfo.sectorId].uiState.openWindows.indexOf(window);
            if (index > -1) {
                sectorData[userInfo.sectorId].uiState.openWindows.splice(index);
            }
            sectorData[userInfo.sectorId].uiState.openWindows.push(window);
            socket.to(userInfo.sectorId).emit("receiveOpenWindow", window);
        });

        socket.on('closeWindow', (window) => {
            const index = sectorData[userInfo.sectorId].uiState.openWindows.indexOf(window);
            if (index > -1) {
                sectorData[userInfo.sectorId].uiState.openWindows.splice(index);
            }
            socket.to(userInfo.sectorId).emit("receiveCloseWindow", window);
        })

        socket.on('setAircraftSelect', (asel, eventId) => {
            if (!_.isEqual(sectorData[userInfo.sectorId].uiState.asel, asel)) {
                sectorData[userInfo.sectorId].uiState.asel = asel;
                socket.to(userInfo.sectorId).emit("receiveAircraftSelect", asel, eventId);
            }
        })

        socket.on('dispatchUiEvent', eventId => {
            socket.to(userInfo.sectorId).emit("receiveUiEvent", eventId);
        })
    });
}
