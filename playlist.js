/* licensed under mit */

/* 
 * Base class for NFy Playlist resource.
 */
module.exports = class {
    priv = [];
    idx = 0;
    onidchange = null;
    constructor(arr, cb) {
        this.onidchange = cb;
        this.priv = arr;
    }
        // get size of playlist.
    getSize() {
        return this.priv.length;
    }
        // gets the index and returns it.
    getIndex() {
        return this.idx;
    }
        // moves index by 1.
    moveByOne() {
        this.idx += 1;
        this.onidchange(this.idx);
    }
    
        // moves index by -1.
    removeByOne() {
        this.idx -= 1;
        this.onidchange(this.idx);
    }
        // sets the index
    setIndex(int) {
        this.idx = int;
    }
        // returns the song at current index
    getCurrentSong() {
        return this.priv[this.idx];
    }
        // check if next exists
    nextExists() {
        return this.priv[this.idx + 1] !== undefined || this.priv[this.idx + 1] !== null;
    }
        // look at the next song without manipulation of index
    peekNext() {
        return this.priv[this.idx + 1];
    }
        // look at the previous song without manipulation of index
    peekPrev() {
        return this.priv[this.idx - 1];
    }
        // check randomizes the playlist
    shuffle() {
        let currentIndex = this.priv.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = this.priv[currentIndex];
            this.priv[currentIndex] = this.priv[randomIndex];
            this.priv[randomIndex] = temporaryValue;
        }

        this.idx = 0;
        this.onidchange(this.idx);
    }
}