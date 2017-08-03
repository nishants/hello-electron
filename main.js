const electron = require('electron');
const request = require('request');
const fs = require('fs');

const {app, BrowserWindow, ipcMain} = electron;

const path = require('path')
const url = require('url')

const appHome = pathFromHome(".zinc");
const downloadDir = pathFromHome(".zinc/downloads");
const fileUrl = "http://nishants.site/dist.zip";
const downloadTempFile = pathFromHome(".zinc/downloads/dist.zip");
const sourceDir = __dirname + "/src";

var downloadListener;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function setup(){
  if (!fs.existsSync(appHome)){
    fs.mkdirSync(appHome);
  }  if (!fs.existsSync(downloadDir)){
    fs.mkdirSync(downloadDir);
  }
}
setup();

function createWindow () {
  // Create the browser window.
  //const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  const {width, height} = {width: 1200, height: 800};
  win = new BrowserWindow({width: width, height: height})

  console.log(width);
  console.log(height);
  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(sourceDir, 'index.html'),
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

//downloadFile(fileUrl, downloadTempFile);


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
  downloadListener && downloadListener.start();

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
    downloadFinished("File succesfully downloaded");
  });
}

function showProgress(received,total){
  var percentage = (received * 100) / total;
  console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");
  downloadListener && downloadListener.showProgress(received,total);
}

function downloadFinished(){
  unzipFile(downloadTempFile, downloadDir);
  downloadListener && downloadListener.downloadFinished();
}

ipcMain.on('get-downloader', (event, arg) => {
  // Print 1
  console.log(arg);
 downloadListener = {
   start: function(){
     event.sender.send('download-started', {});
   },
   showProgress: function(received,total){
     event.sender.send('data-received', {
       received : received,
       total    :total
     });
   },
   downloadFinished: function(){
     event.sender.send('data-finished', {});
   }
 };
// Reply on async message from renderer process
event.sender.send('you-are-listening', "getting updates ?");
});


function unzipFile(zipFilePath, outputPath){
  var AdmZip = require('adm-zip');
  var zip = new AdmZip(zipFilePath);
  zip.extractAllTo(outputPath, /*overwrite*/true);
}

function pathFromHome(path){
  return getUserHome() + "/" + path
}
function getUserHome() {
  return process.env.HOME || process.env.USERPROFILE;
}