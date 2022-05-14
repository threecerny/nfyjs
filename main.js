const electron = require('electron');
const fs = require('fs');
const path = require('path');

function createWin() {
    const window = new electron.BrowserWindow({
        backgroundColor: '#fff',
        width: 1250,
        height: 800,
        minWidth: 1250,
        minHeight: 800,
        maxWidth: 1250,
        maxHeight: 800,
        icon: "./icon.ico",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    window.loadFile('index.html'); // entry point
    window.removeMenu();
};

electron.app.whenReady().then(() => {
    createWin();

    electron.app.on('activate', () => {
        if (electron.BrowserWindow.getAllWindows().length === 0) createWin(); // if no window (create one)
    });
});

electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') electron.app.quit(); // if not darwin (macOS)
});