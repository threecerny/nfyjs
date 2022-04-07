const electron = require('electron');
const fs = require('fs');
const path = require('path');

function createWin() {
    const window = new electron.BrowserWindow({
        width: 600,
        height: 800,
        icon: "./nfy.ico",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    window.loadFile('index.html'); // entry point
    // window.setMenu(null);
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