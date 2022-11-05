const { app, BrowserWindow } = require("electron")

function createWindow () {
  const win = new BrowserWindow({
    width: 950,
    height: 675,
	icon: "src/images/icon.ico",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })
  win.removeMenu()
  win.loadFile("src/index.html")
}

app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})
