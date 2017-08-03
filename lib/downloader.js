var {ipcRenderer, remote} = require('electron');
ipcRenderer.send('get-downloader', 1);
ipcRenderer.on('data-received', (event, arg) => {
  updateProgress(arg.received/arg.total);
});

const modal       = "<div class='downloader-modal'></div>";
const progressBar = "<div class='downloader-progress-bar'><div class='downloader-progress-status'></div></div>"

const buttonWidth = 60;
const statusHeight = 10;
const statusColor = "green";

function updateProgress(fraction){
  console.log(fraction)
  $(".downloader-progress-status").css("transform", "scaleX(<status>)".replace("<status>", fraction));
}

function render(){
  $("body").prepend(modal);
  $(".downloader-modal").first().prepend(progressBar);

  setTimeout(function(){
    $(".downloader-progress-status").css("height", "<status-height>px".replace("<status-height>", statusHeight));
    $(".downloader-progress-status").css("transform", "scaleX(0)");
    $(".downloader-progress-status").css("transform-origin", "0 0");
    $(".downloader-progress-status").css("background", statusColor);
  })

}

$(document).ready(render)
