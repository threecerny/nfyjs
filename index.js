const fs = require("fs");
const path = require("path");
const eventEmitter = require("events");

const os = require("os");

const playlist = require("./playlist.js");

const discordRPC = require("discord-rpc");
const { shell } = require("electron");
const rpc = new discordRPC.Client({ transport: "ipc" });

const clientId = "961150717748445245";
discordRPC.register(clientId);

const client = new eventEmitter();

// var inPlaylist = false;
var playing = false;
var looping = false;

let songBuffer = null;

function log(text) {
    document.getElementById("LOG").innerText = text
    setTimeout(() => {
        document.getElementById("LOG").innerText = "";
    }, 5000)
}

function parse_time(t_in_seconds) {
    let time = t_in_seconds;
    let _t = "";
    var minutes = ~~((time % 3600) / 60);;
    var seconds = parseInt(time % 60);
    if (seconds == NaN) { seconds = 0 }
    let secs = ""

    _t += parseInt(minutes.toString()) + ":";

    if (seconds < 10) {
        secs += "0";
    }

    secs += seconds.toString();

    if (secs == NaN) {
        secs = "00";
    }

    _t += secs;


    return _t;
}

window.onload = function () {

    var Songs;

    Songs = null;

    let homeDir = os.homedir();
    let songs;
    let dirPath;
    let config;

    let bottomBar = document.getElementById("bottom-bar");
    let songDiv = document.getElementById("song");
    let title = document.getElementById("title");

    let loading = document.getElementById("loading");
    let author = document.getElementById("author");

    bottomBar.style.visibility = "hidden";
    songDiv.style.visibility = "hidden";
    title.style.visibility = "hidden";

    let playButton = document.getElementById("playButton");
    let playImage = document.getElementById("playImage");
    let playSrc = "./images/playing.png";
    let pauseSrc = "./images/paused.png";

    let prevButton = document.getElementById("prevButton");
    let prevImage = document.getElementById("prevImage");
    let prevSrc = "./images/previous.png";

    let nextButton = document.getElementById("nextButton");
    let nextImage = document.getElementById("nextImage");
    let nextSrc = "./images/next.png";

    let loopButton = document.getElementById("loopButton");
    let loopImage1 = document.getElementById("loopImage1");
    let loopImage2 = document.getElementById("loopImage2");

    let shuffleButton = document.getElementById("shuffleButton");

    let dirButton = document.getElementById("dirButton");

    playImage.src = pauseSrc;
    prevImage.src = prevSrc;
    nextImage.src = nextSrc;

    if (!fs.existsSync(`${homeDir}/.nfyJS`)) {
        fs.mkdirSync(`${homeDir}/.nfyJS`);
        dirPath = path.join(homeDir, ".nfyJS");
        fs.writeFileSync(`${dirPath}/config.json`, "");
        fs.mkdirSync(`${dirPath}/songs`);
        songs = path.join(dirPath, "songs");
        config = path.join(dirPath, "config.json");
    } else {
        dirPath = path.join(homeDir, ".nfyJS");
        songs = path.join(dirPath, "songs");
        if (!fs.existsSync(`${dirPath}/songs`)) {
            fs.mkdirSync(`${dirPath}/songs`);
            songs = path.join(dirPath, "songs");
        } else songs = path.join(dirPath, "songs");
        if (!fs.existsSync(`${dirPath}/config.json`)) {
            fs.writeFileSync(`${dirPath}/config.json`, "");
            config = path.join(dirPath, "config.json");
        } else config = path.join(dirPath, "config.json");
    }

    function PlayMusicWrap() {
        songBuffer = null;
        client.emit("playMusic");
    }

    if (fs.existsSync(songs)) {
        Songs = songs;

        Songs = songs;
    } else {
        fs.mkdirSync(songs);
        Songs = songs;
    }

    Songs = songs;

    var nfyPlaylist = null

    client.on("start", () => {
        nfyPlaylist = new playlist(fs.readdirSync(Songs), function (newIndex) {
            if (songBuffer !== null) {
                songBuffer = null;
                PlayMusicWrap();
            } else {
                songBuffer = null;
                PlayMusicWrap();
            }
        });

        rpc.setActivity({
            details: "Idle",
            largeImageKey: "rpca",
            smallImageKey: "js-logo",
            smallImageText: "Sometimes I wish you would use NFy JS",
            buttons: [{
                label: "Github",
                url: "https://github.com/Cliometric/NFY"
            }]
        })

        bottomBar.style.visibility = "visible";
        songDiv.style.visibility = "visible";
        title.style.visibility = "visible";

        loading.remove();
        author.remove();
    })

    setTimeout(() => {
        author.innerText = "R";
        setTimeout(() => {
            author.innerText = "Ro";
            setTimeout(() => {
                author.innerText = "Roe";
                setTimeout(() => {
                    client.emit("start");
                }, 750);
            }, 1000);
        }, 1000);
    }, 500);

    client.on("movePlaylist", () => {
        if (nfyPlaylist.peekNext() === null) {
            nfyPlaylist.setIndex(0);
            songBuffer = null;
        }
        if (songBuffer !== null) {
            songBuffer.pause();
            playing = false;
            playImage.src = pauseSrc;
        }

        songBuffer = null;

        if (nfyPlaylist.peekNext() !== null || nfyPlaylist.peekNext() !== undefined) {
            if (nfyPlaylist.peekNext() === undefined || nfyPlaylist.peekNext() === null) {
                nfyPlaylist.setIndex(0);
                songBuffer = null;
            } else {
                nfyPlaylist.moveByOne();
                PlayMusicWrap();
                playing = true;
            }
        } else {
            nfyPlaylist.setIndex(0);
            songBuffer = null;
        }
    })

    client.on("removePlaylist", () => {
        if (nfyPlaylist.peekPrev() === null) {
            nfyPlaylist.setIndex(0);
            songBuffer = null;
        }
        if (songBuffer !== null) {
            songBuffer.pause();
            playing = false;
            playImage.src = pauseSrc;
        }

        songBuffer = null;

        if (nfyPlaylist.peekPrev() !== null || nfyPlaylist.peekPrev() !== undefined) {
            if (nfyPlaylist.peekPrev() === undefined || nfyPlaylist.peekPrev() === null) {
                nfyPlaylist.setIndex(0);
                songBuffer = null;
            } else {
                nfyPlaylist.moveByOne();
                PlayMusicWrap();
                playing = true;
            }
        } else {
            nfyPlaylist.setIndex(0);
            songBuffer = null;
        }
    })


    client.on("playMusic", () => {
        if (nfyPlaylist.getCurrentSong() == null) {
            log("error: failed to load songs,\n" +
                "do you have a songs directory in place?")
            return /* fix infinite attempts for null playlist */
        }

        let song = `${Songs}/${nfyPlaylist.getCurrentSong()}`;
        let songTitle = document.getElementById("song-title");

        let parsedName = path.parse(path.basename(song)).name;

        songTitle.innerText = parsedName;

        if (songBuffer !== null && playing) songBuffer.pause();

        fs.exists(song, (err) => {
            // if (err) { log("Node.js threw an unbeknownst exists() error."); return; }
            if (!playing) {
                if (songBuffer == null) {
                    songBuffer = new Audio(song);

                    songBuffer.play();

                    playing = true
                    playImage.src = playSrc;
                } else {
                    if (songBuffer != null) {
                        songBuffer.play();
                        playImage.src = playSrc;
                    }
                    playing = true;
                }

                songBuffer.addEventListener("timeupdate", function () {
                    let timeHandler = document.getElementById("song-time");

                    if (nfyPlaylist.getCurrentSong() === null) {
                        nfyPlaylist.setIndex(0);
                        PlayMusicWrap();
                    }

                    if (songBuffer) {
                        let time = parse_time(songBuffer.currentTime) + " - " + parse_time(songBuffer.duration);

                        timeHandler.innerText = time;
                        rpc.setActivity({
                            details: `Listening to ${parsedName}`,
                            largeImageKey: "rpca",
                            largeImageText: "Listening with NFy JS",
                            smallImageKey: "js-logo",
                            smallImageText: "Sometimes I wish you would use NFy JS",
                            buttons: [{
                                label: "Github",
                                url: "https://github.com/Cliometric/NFY"
                            }]
                        });
                    }
                });

                songBuffer.onended = function () {
                    if (looping) {
                        songBuffer.play();
                    } else if (nfyPlaylist.nextExists()) {
                        nfyPlaylist.moveByOne();
                        songBuffer = null;
                        PlayMusicWrap();
                    }
                }


            } else {
                playing = false;
                if (songBuffer != null) {
                    songBuffer.pause();
                    playImage.src = pauseSrc;
                    rpc.setActivity({
                        details: "Idle",
                        largeImageKey: "rpca",
                        smallImageKey: "js-logo",
                        smallImageText: "Sometimes I wish you would use NFy JS",
                        buttons: [{
                            label: "Github",
                            url: "https://github.com/Cliometric/NFY"
                        }]
                    })
                }
            }
        })
    })

    client.on("loopClicked", () => {
        if (looping === true) {
            looping = false;
            loopImage1.style.visibility = "visible";
            loopImage2.style.visibility = "hidden";
        } else {
            looping = true;
            loopImage1.style.visibility = "hidden";
            loopImage2.style.visibility = "visible";
        }
    })

    client.on("shuffleClicked", () => {
        nfyPlaylist.shuffle();
        PlayMusicWrap();
    })

    client.on("openDir", () => {
        if (fs.existsSync(Songs)) {
            shell.openPath(Songs)
        } else {
            fs.mkdirSync(`${homeDir}/.nfyJS`);
            dirPath = path.join(homeDir, ".nfyJS");
            fs.writeFileSync(`${dirPath}/config.json`, "");
            fs.mkdirSync(`${dirPath}/songs`);
            songs = path.join(dirPath, "songs");
            config = path.join(dirPath, "config.json");
            shell.openPath(songs)
        }
    })

    playButton.addEventListener("click", function () {
        client.emit("playMusic");
    });

    prevButton.addEventListener("click", function () {
        client.emit("removePlaylist");
    });

    nextButton.addEventListener("click", function () {
        client.emit("movePlaylist");
    });

    loopButton.addEventListener("click", function () {
        client.emit("loopClicked");
    });

    shuffleButton.addEventListener("click", function () {
        client.emit("shuffleClicked");
    })

    dirButton.addEventListener("click", function () {
        client.emit("openDir");
    });
}

rpc.login({ clientId });