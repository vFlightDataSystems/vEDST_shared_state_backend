/**
 * @author Cian Ormond <co@cianormond.com>
 */

import express from 'express';
import bodyParser from 'body-parser';
import { Sector } from "./types/sector";
import socket from "./api/sockets";
import { Server } from "http";
import dotenv from "dotenv";
dotenv.config();

const app: express.Application = express();
const http = require('http');
const server: Server = http.createServer(app);
const port: number = 4000;

// Configure body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

export let sectors: Record<string, Sector> = {};

export let activeUsers = new Map<string, string>();

// Use GET routes from api/get.ts
app.use('/', require('./api/get.ts'));
// Use websocket code from api/sockets.ts
socket(server);

server.listen(port, () =>{
    console.log('Listening on port ' + port)
})