var {ipcRenderer, remote} = require('electron');
var main = remote.require("./main.js");

ipcRenderer.send('get-downloader', 1);
ipcRenderer.on('data-received', (event, arg) => {
console.log(arg);
});