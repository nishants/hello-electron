var electron = require('electron');
var request = require('request');
var fs = require('fs');

const {app, BrowserWindow, ipcMain} = electron;
const path = require('path')
const url = require('url')

var downloadListener;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  //const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  const {width, height} = {width: 1200, height: 800};
  win = new BrowserWindow({width: width, height: height})

  console.log(width);
  console.log(height);
  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'src/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
   win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
// Quit when all windows are closed.
downloadFile("http://nishants.site/dist.zip", "/Users/dawn/Desktop/downloaded/dist.zip");
app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
    global.myClient = {name: "Zinc"};

}
})

function downloadFile(file_url , targetPath){
  // Save variable to know progress
  var received_bytes = 0;
  var total_bytes = 0;

  var req = request({
    method: 'GET',
    uri: file_url
  });

  var out = fs.createWriteStream(targetPath);
  req.pipe(out);

  req.on('response', function ( data ) {
    // Change the total bytes value to get progress later.
    total_bytes = parseInt(data.headers['content-length' ]);
  });

  req.on('data', function(chunk) {
    // Update the received bytes
    received_bytes += chunk.length;

    showProgress(received_bytes, total_bytes);
  });

  req.on('end', function() {
    alert("File succesfully downloaded");
  });
}

function showProgress(received,total){
  var percentage = (received * 100) / total;
  console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");
  downloadListener && downloadListener.showProgress(received,total);
}
ipcMain.on('get-downloader', (event, arg) => {
  // Print 1
  console.log(arg);
 downloadListener = {
   showProgress: function(received,total){
     event.sender.send('data-received', {
       received : received,
       total    :total
     });
   }
 };
// Reply on async message from renderer process
event.sender.send('you-are-listening', "getting updates ?");
});