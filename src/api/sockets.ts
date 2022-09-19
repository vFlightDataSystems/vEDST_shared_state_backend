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
    updateAircraft: (payload: SharedAircraftDto) => void;
    setAclState: (value: AclState) => void;
    setDepState: (value: DepState) => void;
    setGpdState: (value: GpdState) => void;
    setPlanState: (value: PlanState) => void;
    setAircraftSelect: (asel: Asel | null, eventId: string | null) => void;
    openWindow: (window: EdstWindow) => void
    closeWindow: (window: EdstWindow) => void
    clearPlanQueue: () => void;
    dispatchUiEvent: (eventId: string, arg?: any) => void;
    sendGIMessage: (recipient: string, message: string) => void;
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
    receiveUiEvent: (eventId: string, arg?: any) => void;
    receiveGIMessage: (sender: string, message: string) => void;
}

export default function(server: HttpServer) {

    const io = new Server(server, {
        cors: {
            origin: process.env.corsOrigin,
        }
    });

    io.of("/").adapter.on("create-room", (room) => {
        if (room.match(/^[A-Z]{3}-\d{2}$/)) {
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

        const artccId = socket.handshake.query.artccId;
        const sectorId = socket.handshake.query.sectorId;
        
        if (socket.handshake.auth?.token !== process.env.authToken || !(typeof artccId === "string" && typeof sectorId === "string")) {
            socket.disconnect();
        }

        const userInfo = {
            id: socket.id,
            sectorId: sectorId as string,
            artccId: artccId as string
        };
        const positionId = `${userInfo.artccId}-${userInfo.sectorId}`;

        socket.join(positionId);
        socket.join(userInfo.sectorId);

        if (!sectorData[positionId]) {
            sectorData[positionId] = new SharedSectorData(positionId);
        } else {
            Object.values(sectorData[positionId].aircraftData).forEach(aircraft => socket.emit("receiveAircraft", aircraft));
            socket.emit("receiveUiState", sectorData[positionId].uiState);
        }

        socket.on('updateAircraft', payload => {
            sectorData[positionId].timeModified = Date.now();
            const aircraft = new SharedAircraftDto(payload);
            if (!_.isEqual(sectorData[positionId].aircraftData[aircraft.aircraftId], aircraft)) {
                sectorData[positionId].aircraftData[aircraft.aircraftId] = aircraft;
                socket.to(positionId).emit("receiveAircraft", aircraft);
            }
        });

        socket.on('setAclState', (value) => {
            if (!_.isEqual(sectorData[positionId].uiState.acl, value)) {
                sectorData[positionId].uiState.acl = value;
                socket.to(positionId).emit("receiveAclState", value);
            }
        })

        socket.on('setDepState', (value) => {
            if (!_.isEqual(sectorData[positionId].uiState.acl, value)) {
                sectorData[positionId].uiState.dep = value;
                socket.to(positionId).emit("receiveDepState", value);
            }
        })

        socket.on('setGpdState', (value) => {
            if (!_.isEqual(sectorData[positionId].uiState.acl, value)) {
                sectorData[positionId].uiState.gpd = value;
                socket.to(positionId).emit("receiveGpdState", value);
            }
        })

        socket.on('setPlanState', (value) => {
            if (!_.isEqual(sectorData[positionId].uiState.acl, value)) {
                sectorData[positionId].uiState.plansDisplay = value;
                socket.to(positionId).emit("receivePlansDisplayState", value);
            }
        })

        socket.on('openWindow', (window) => {
            const index = sectorData[positionId].uiState.openWindows.indexOf(window);
            if (index > -1) {
                sectorData[positionId].uiState.openWindows.splice(index);
            }
            sectorData[positionId].uiState.openWindows.push(window);
            socket.to(positionId).emit("receiveOpenWindow", window);
        })

        socket.on('closeWindow', (window) => {
            const index = sectorData[positionId].uiState.openWindows.indexOf(window);
            if (index > -1) {
                sectorData[positionId].uiState.openWindows.splice(index);
            }
            socket.to(positionId).emit("receiveCloseWindow", window);
        })

        socket.on('setAircraftSelect', (asel, eventId) => {
            if (!_.isEqual(sectorData[positionId].uiState.asel, asel)) {
                sectorData[positionId].uiState.asel = asel;
                socket.to(positionId).emit("receiveAircraftSelect", asel, eventId);
            }
        })

        socket.on('dispatchUiEvent', (eventId, arg) => {
            socket.to(positionId).emit("receiveUiEvent", eventId, arg);
        })

        socket.on('sendGIMessage', (recipient, message) => {
            if (recipient.length === 2) {
                recipient = `${userInfo.artccId}-${recipient}`;
            }
            io.to(recipient).emit("receiveGIMessage", userInfo.sectorId, message);
        })
    });
}
