const fs = require("fs");
const path = require('path');
const EventEmitter = require("events");

const playlist = require("./playlist.js");

const throttle = (func, limit) => {
    let lastFunc
    let lastRan
    return function() {
        const context = this
        const args = arguments
        if (!lastRan) {
            func.apply(context, args)
            lastRan = Date.now()
        } else {
            clearTimeout(lastFunc)
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args)
                    lastRan = Date.now()
                }
            }, limit - (Date.now() - lastRan))
        }
    }
}

const client = new EventEmitter();

var PLAYING = false;
var IN_PLAYLIST = false; //;
var LOOPING = false

let songBuffer = null; // rip

var i = 0;
var max = 0;

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
        secs = "00"
        console.log("Changed")
    }

    _t += secs;


    return _t;
}

setTimeout(function() {

    var play_button = document.getElementById("play_button");

    var Songs = fs.readdirSync("./songs/");

    function PlayMusicWrap() {
        songBuffer = null;
        client.emit("playMusic");
    }
    var nfyPlaylist = new playlist(Songs, function(newIndex) {

        if (nfyPlaylist.getCurrentSong() !== null || nfyPlaylist.getCurrentSong() !== undefined) { // hmm,
            if (songBuffer !== null) {
                console.log("PLAYING");
                songBuffer = null;
                PlayMusicWrap();
            }
        } else {
            console.log("NO SONG FOUND AFTER RESTARTING");
            nfyPlaylist.setIndex(0);
            songBuffer = null;
            PlayMusicWrap();
        }

    });
    client.on('MovePlaylist', () => {
        if (nfyPlaylist.peekNext() === null) {
            nfyPlaylist.setIndex(0)
            songBuffer = null
            client.emit('playMusic')
        }
        if (songBuffer !== null) {
            songBuffer.pause();
            PLAYING = false;
            play_button.innerText = "play"
        }
        songBuffer = null
        if (nfyPlaylist.peekNext() !== null || nfyPlaylist.peekNext() !== undefined) {

            console.log(`Song: ${nfyPlaylist.peekNext()}`);
            if (nfyPlaylist.peekNext() === undefined || nfyPlaylist.peekNext() === null) {
                console.log("FAILED CHECK");
                nfyPlaylist.setIndex(0);
                songBuffer = null;
                client.emit("playMusic")
            } else {
                console.log("PASSED");
                nfyPlaylist.moveByOne();
                songBuffer = null;
                client.emit('playMusic');
            }
        } else {

            console.log("FAILED CHECK");
            nfyPlaylist.setIndex(0);
            songBuffer = null;
            client.emit('playMusic');
        }


    })



    client.on('playMusic', () => {

        if (nfyPlaylist.getCurrentSong() === null) {
            nfyPlaylist.setIndex(0);

        }

        let song = `./songs/${nfyPlaylist.getCurrentSong()}`;

        var song_name_element = document.getElementById("song_name");
        var song_nameWE = path.parse(path.basename(song)).name;

        song_name_element.innerText = song_nameWE;

        if (songBuffer !== null && PLAYING) songBuffer.pause();

        fs.exists(song, () => {
            if (!PLAYING) {

                if (songBuffer === null) {
                    songBuffer = new Audio(song);

                    songBuffer.play();

                    PLAYING = true
                    play_button.innerText = "stop";
                } else {
                    if (songBuffer !== null) {
                        songBuffer.play();
                        play_button.innerText = "stop";
                    }

                    PLAYING = true;
                }

                songBuffer.addEventListener('timeupdate', function() {
                    let p = document.getElementById("time_handler");
                    if (nfyPlaylist.getCurrentSong() === null) {
                        nfyPlaylist.setIndex(0);
                        PlayMusicWrap()
                    }
                    if (songBuffer) {
                        let time = parse_time(songBuffer.currentTime) + " - " + parse_time(songBuffer.duration);

                        console.log("HELLO " + time);
                        console.log(songBuffer.duration);
                        console.log(songBuffer.currentTime);
                        p.innerText = time;
                    }
                });



                songBuffer.onended = function() {
                    if (LOOPING) {
                        songBuffer.play();
                        // if (nfyPlaylist.getCurrentSong() !== null) {
                        //     PlayMusicWrap();
                        // }
                    } else if (nfyPlaylist.nextExists()) {
                        console.log("hello")

                        nfyPlaylist.moveByOne();

                        songBuffer = null

                        PlayMusicWrap()
                    }
                }


            } else {

                PLAYING = false;
                if (songBuffer !== null) {
                    songBuffer.pause();
                    play_button.innerText = "play";
                } else {
                    console.log("Wrong play");
                    // songBuffer.pause();
                }

            }
        })
    })

    client.on('loopClicked', () => {
        if (LOOPING === true) LOOPING = false;
        else LOOPING = true;
    })

}, 0);