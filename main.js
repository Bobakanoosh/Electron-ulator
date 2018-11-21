
const electron = require('electron');
const {app, BrowserWindow, ipcMain, Menu} = electron;
const { template } = require('./app-menu-template')
const windowStateKeeper = require('electron-window-state');
const mousetrap = require('mousetrap');
require('electron-reload')(__dirname);

let mainWindow;

/*   -----------------------------
 *   ---------- SETUP ------------
 *   -----------------------------
 */

function createWindow () {

  // Saves window state like height, width, and position.
  let ws = windowStateKeeper({
  })

  // Width: 450 for 5 wide buttons
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 360,
    height: 560,
    x: ws.x,
    y: ws.y,
    frame: false,
    backgroundColor: "#1d1626",
  });

  ws.manage(mainWindow);

  mainWindow.loadFile('./views/index.html');
  mainWindow.setResizable(false);

  mainWindow.on('resize', function() {
    //console.log(mainWindow.getSize());
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null
  });
}

/*   -----------------------------
 *   ---------- EVENTS -----------
 *   -----------------------------
 */
app.on('ready', createWindow);

app.on('activate', function () {
  // Mac check
  if (mainWindow === null) {
    createWindow()
  }
});

app.on('unresponsive', function() {

});

/*   -----------------------------
 *   --------- RECEIVING ---------
 *   -----------------------------
 */

ipcMain.on('display-app-menu', (event, arg) => {
  const appMenu = Menu.buildFromTemplate(template)
  if(mainWindow) {
    appMenu.popup(mainWindow, arg.x, arg.y)
  }
})

ipcMain.on('expand-calculator', (event, arg) => {

  // Allow Resizing
  mainWindow.setResizable(true);

  // If current layout is default
  if(arg.current == 0)
    mainWindow.setSize(450, 560);
  else if(arg.current == 1)
    mainWindow.setSize(360, 560);
    
  // Block Resizing
  mainWindow.setResizable(false);

})