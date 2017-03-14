/*
    EventBus.on
    EventBus.emit
    EventBus.broadcast

    ----------------------------------------

    const XtremeEventBus = new EventBus();

    XtremeEventBus.on('componentManagment:componentSelected', () => {
        console.log('componentSelected occurred!');
    });

    XtremeEventBus.emit('event');
    XtremeEventBus.broadcast('event');

                ipcMain
    ------------------------------------(electron)
    ipcRenderer ipcRenderer ipcRenderer
*/

"use strict";

const EventEmitter = require('events');
const electron = require('electron');

function isRenderer () {
    // running in a web browser
    if (typeof process === 'undefined') return true;

    // node-integration is disabled
    if (!process) return true;

    // We're in node.js somehow
    if (!process.type) return false;

    return process.type === 'renderer';
}

class EventBus extends EventEmitter {
    constructor(name = 'default') {
        super(); //must call super for "this" to be defined.
        this._channelName = name;
        this._baseEventKey = `EventBus-${name}:`;
    }

    on(event, listender) {
        const ipc = isRenderer() ? electron.ipcRenderer : electron.ipcMain;

        if (Array.isArray(event)) {
            event.forEach(e => this.on(e, listender));
            return;
        }

        ipc.on(this._baseEventKey + event, (e, argsJson) => {
            const args = JSON.parse(argsJson);
            return listender && listender(...args);
        });

        return super.on(event, listender);
    }

    emit(event, ...args) {
        const ipc = isRenderer() ? electron.ipcRenderer : electron.ipcMain;

        if (isRenderer()) {
            this.broadcast(event, args);
        }
    }

    broadcast(event, ...args) {
        const mainProcess = isRenderer() ? electron.remote : electron;
        const webContents = mainProcess.webContents;
        const ipcRenderer = electron.ipcRenderer;
        const allContents = webContents.getAllWebContents();
        const ipcArgs = [this._baseEventKey + event, JSON.stringify(Array.from(args))];

        if (isRenderer()) { // renderer process
            const curContents = mainProcess.getCurrentWebContents();

            allContents
                .filter(contents => contents.id !== curContents.id)
                .forEach(contents => contents.send(...ipcArgs));
            ipcRenderer.send();
        } else { // main process
            allContents
                .forEach(contents => contents.send(...ipcArgs));
        }

        return super.emit(event, ...args);
    }
}

module.exports = EventBus;
