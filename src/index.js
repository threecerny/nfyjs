const fs = require("fs")
const path = require("path")
const mouseTrap = require("mousetrap")

let songBuffer = null

let playing = false

let songsDir
let mainDir
let songs = []

let looping = false
let volume = 0.5

const homeDir = require("os").homedir()

if (!fs.existsSync(path.join(homeDir, ".nfyjs"))) {
    fs.mkdirSync(path.join(homeDir, ".nfyjs"))
    mainDir = path.join(path.join(homeDir, ".nfyjs"))
    fs.mkdirSync(path.join(mainDir, "songs"))
    songsDir = path.join(mainDir, "songs") 
} else {
    mainDir = path.join(path.join(homeDir, ".nfyjs"))
    if (!fs.existsSync(path.join(mainDir, "songs"))) {
        fs.mkdirSync(path.join(mainDir, "songs"))
        songsDir = path.join(mainDir, "songs")
    } else songsDir = path.join(mainDir, "songs")
}

const songsDiv = document.getElementById("songs")

const dirBtn = document.getElementById("dirBtn")
const loopBtn = document.getElementById("loopBtn")

const nowPlayingDiv = document.getElementById("nowPlayingDiv")
const nowPlaying = document.getElementById("nowPlaying")
const nowPlayingTime = document.getElementById("nowPlayingTime")

mouseTrap.bind("left", () => {
    if (songBuffer)
        songBuffer.currentTime = (songBuffer.currentTime - 5);
})

mouseTrap.bind("right", () => {
    if (songBuffer)
        songBuffer.currentTime = (songBuffer.currentTime + 5);
})

mouseTrap.bind("space", () => {
    if (songBuffer)
        if (playing) {
            songBuffer.pause()
            playing = false
        } else {
            songBuffer.play()
            playing = true
        }
})

nowPlayingDiv.addEventListener("click", function() {
    if (songBuffer)
        if (playing) {
            songBuffer.pause()
            playing = false
        } else {
            songBuffer.play()
            playing = true
        }
}) 

const volumeSldr = document.getElementById("volume")

volumeSldr.onchange = function() {
	volume = volumeSldr.value / 100
	if (songBuffer)
		songBuffer.volume = volume
}

function parseHMS(seconds) {
    let time = seconds

    let _t = ""

    var minutes = ~~((time % 3600) / 60)
    var seconds = parseInt(time % 60)

    if (seconds == NaN) { seconds = 0 }

    let secs = ""

    _t += parseInt(minutes.toString()) + ":"

    if (seconds < 10) {
        secs += "0"
    }

    secs += seconds.toString()

    if (secs == NaN) {
        secs = "00"
    }

    _t += secs

    return _t
}

function clearPlaying() {
    nowPlaying.hidden = true
    nowPlayingTime.hidden = true
}
clearPlaying()

function changePlaying(name) {
    nowPlaying.hidden = false
    nowPlaying.innerText = name
}

function changeTime(audio) {
    nowPlayingTime.hidden = false
    audio.addEventListener("timeupdate", function() {
        let time = parseHMS(audio.currentTime)
        nowPlayingTime.innerText = time
    })
}

class song {
    constructor(name, time, fileName) {
        this.name = name
        this.time = time
        this.play = function play() {
            for (const file of fs.readdirSync(songsDir)) {
                const filePath = path.join(songsDir, file)
                const songPath = path.join(songsDir, fileName)

                if (filePath == songPath) {
                    if (songBuffer !== null && playing) songBuffer.pause()

                    fs.exists(songPath, (err) => {
                        if (songBuffer == null) {
                            songBuffer = new Audio(songPath) 
							songBuffer.volume = volume

                            songBuffer.play()
                            
                            changePlaying(name)
                            changeTime(songBuffer)

                            playing = true
                        } else {
                            if (!playing) {
								songBuffer = new Audio(songPath)
                                songBuffer.play()
                                changePlaying(name)
                                changeTime(songBuffer)
								playing = true
							} else {
                                songBuffer.pause()
                                playing = false
							}
                        }
                        songBuffer.onended = () => {
                            if (looping) {
                                songBuffer.play()
                                changePlaying(name)
                                changeTime(songBuffer)
								playing = true
                            } else {
                                let randomSong = songs[Math.floor(Math.random() * (songs.length - 0) + 0)]
                                songBuffer = new Audio(randomSong)
                                songBuffer.play()
                                changePlaying(path.parse(randomSong).name)
                                changeTime(songBuffer)
                                playing = true
                            }
                        }
                    })
                }
            }
        }
    }
}

function createSong(c) {
    const song = document.createElement("div")
    const nameEl = document.createElement("span")
    const timeEl = document.createElement("span")

    song.className = "flex justify-between"
    nameEl.className = "float-left text-2xl font-semibold text-slate-600"
    timeEl.className = "float-right text-2xl font-semibold text-slate-600"
    
    nameEl.innerText = c.name
    timeEl.innerText = c.time

    songsDiv.appendChild(song)
    song.appendChild(nameEl)
    song.appendChild(timeEl)

    song.addEventListener("click", () => {
        c.play()
    })
}

for (const file of fs.readdirSync(songsDir)) {
    if (file.endsWith(".mp3" || file.endsWith(".wav"))) {
		const newSongBuffer = new Audio(path.join(songsDir, file))
		newSongBuffer.onloadedmetadata = function() {
            let songC = new song(path.parse(file).name, parseHMS(Math.floor(newSongBuffer.duration)).toString(), file)
            songs.push(path.join(songsDir, file))
		    newSongBuffer.volume = volume
			createSong(songC)
		}
    }
}

dirBtn.addEventListener("click", () => {
    const shell = require("electron").shell;
    const open = shell.openPath || shell.openItem;

    if (fs.existsSync(songsDir)) {
        open(songsDir)
    } else {
        if (!fs.existsSync(path.join(homeDir, ".nfyjs"))) {
            fs.mkdirSync(path.join(homeDir, ".nfyjs"))
            mainDir = path.join(path.join(homeDir, ".nfyjs"))
            fs.mkdirSync(path.join(mainDir, "songs"))
            songsDir = path.join(mainDir, "songs")
            open(songsDir)
        } else {
            mainDir = path.join(path.join(homeDir, ".nfyjs"))
            if (!fs.existsSync(path.join(mainDir, "songs"))) {
                fs.mkdirSync(path.join(mainDir, "songs"))
                songsDir = path.join(mainDir, "songs")
                open(songsDir)
            } else {
                songsDir = path.join(mainDir, "songs")
                open(songsDir)
            }
        }
    }
})

loopBtn.addEventListener("click", () => {
    if (looping == false) {
        loopBtn.classList.toggle("text-indigo-400")
        loopBtn.classList.toggle("hover:bg-indigo-400")
        looping = true
    } else {
        loopBtn.classList.toggle("text-indigo-400")
        loopBtn.classList.toggle("hover:bg-indigo-400")
        looping = false
    }
})