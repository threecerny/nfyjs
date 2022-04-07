const fs = require("fs");
// const discordRPC = require('discord-rpc');
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

let songBuffer = null; // rip

var i = 0;
var max = 0;

// const clientID = '961150717748445245';
// const RPC = new discordRPC.Client({ transport: 'ipc' });

// discordRPC.register(clientID); //oh sick rpc? yes

// function rich_presence_song

// function rich_presence_neuter

function parse_time(t_in_seconds) {
    let time = t_in_seconds;
    let _t = "";
    var minutes = ~~((time % 3600) / 60);;
    var seconds = parseInt(time % 60);
    if (seconds == NaN) { seconds = 0}
    let secs = "" //test it

    _t += parseInt(minutes.toString()) + ":";

    if (seconds < 10) {
        secs += "0";
    }
    
    secs += seconds.toString();

    if (secs == NaN)  {
        secs = "00"
        console.log("Changed")
    }

    _t += secs;


    return _t;
}

setTimeout(function() { //see how that works?
    // this is test try it in console
    // try changing it using button

    var error_log = document.getElementById("ERROR_LOG");
    var play_button = document.getElementById("play_button");

    function ERROR(txt) {
        error_log.innerText = txt;
        setTimeout(function() {
            error_log.innerText = "";
        }, 2000);
    }
    var Songs = fs.readdirSync("./songs/");

    function PlayMusicWrap() {
        songBuffer = null;
        client.emit("playMusic");
    }
    var nfyPlaylist = new playlist(Songs, function(newIndex) {
        // play next song on change
        
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
    // move through playlist
    client.on('MovePlaylist', () => {
        if (nfyPlaylist.peekNext()===null) {
            nfyPlaylist.setIndex(0)
            songBuffer = null
            client.emit('playMusic')
        }
        if (songBuffer !== null) { songBuffer.pause(); // force pause
        PLAYING = false;
        play_button.innerText = "play"
        }   
        songBuffer = null
        if (nfyPlaylist.peekNext() !== null || nfyPlaylist.peekNext() !== undefined) {
            /// 

            console.log(`Song: ${nfyPlaylist.peekNext()}`); // try looking at this line
            if (nfyPlaylist.peekNext() === undefined || nfyPlaylist.peekNext() === null) {
                console.log("FAILED CHECK");
                nfyPlaylist.setIndex(0);
                songBuffer = null;
                client.emit("playMusic")
            } else {
                console.log("PASSED");
                nfyPlaylist.moveByOne(); //.
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

        } //try again


        //what is this for idk
        // wait that's handled already you don't need that
        ///why

        let song = `./songs/${nfyPlaylist.getCurrentSong()}`;

        // time_handler.innerText = time;

        // among us
        //tryit
        // 
        if (songBuffer !== null && PLAYING) songBuffer.pause();

        fs.exists(song, () => {
            if (!PLAYING) {

                if (songBuffer === null) { // first time playing 
                    songBuffer = new Audio(song);

                    songBuffer.play();

                    PLAYING = true
                    play_button.innerText = "stop";
                } else {
                    if (songBuffer !== null) { // second, third, if stopped then play
                        songBuffer.play();
                        play_button.innerText = "stop";
                    }

                    PLAYING = true;
                }

                songBuffer.addEventListener('timeupdate', function() {
                    let p = document.getElementById("time_handler");
                    if (nfyPlaylist.getCurrentSong() === null) {
                        nfyPlaylist.setIndex(0);
                        PlayMusicWrap() // idk bro juas try it
                    } //among us balls
                    if (songBuffer) {
                        let time = parse_time(songBuffer.currentTime) + " - " + parse_time(songBuffer.duration); // done:)

                        console.log("HELLO " + time);
                        console.log(songBuffer.duration);
                        console.log(songBuffer.currentTime);
                        p.innerText = time;
                    }
                });



                songBuffer.onended = function() {
                    if (IN_PLAYLIST) {

                        if (nfyPlaylist.nextExists()) {
                            console.log("hello")
                            nfyPlaylist.moveByOne();
                            PlayMusicWrap()
                        }
                    }
                }


            } else {

                PLAYING = false;
                if (songBuffer !== null) {
                    songBuffer.pause();
                    play_button.innerText = "play";
                } else {
                    console.log("Wrong play");
                    songBuffer.pause();
                }

            }
        })
    })

    // done with prototype
    // all you need to do is connect the events to backend
    // however you did the music one
    // and what should happen, is when you press play, it will load first in array
    // then you can move in the array and play other songs in the array

}, 0);
// just implemented song search
// based on standard
// RPC.login({ clientID }).catch(console.error);