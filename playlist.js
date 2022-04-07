/* licensed under mit */

/* 
 * Base class for NFy Playlist resource.
 */
module.exports = class {
    priv = []
    idx = 0
    onidchange = null
    constructor(arr, cb) {
            this.onidchange = cb
            this.priv = arr
        }
        // get size of playlist.
    getSize() {
            return this.priv.length
        }
        // gets the index and returns it.
    getIndex() {
            return this.idx
        }
        // moves index by 1.
    moveByOne() {

        this.idx += 1;
        this.onidchange(this.idx);

    }
    setIndex(int) {
            this.idx = int
        }
        // returns the song at current index
    getCurrentSong() {
            return this.priv[this.idx]
        }
        // check if next exists
    nextExists() {
        return this.priv[this.idx + 1] !== undefined || this.priv[this.idx + 1] !== null
    }

    // look at the next song without manipulation of index
    peekNext() {
        return this.priv[this.idx + 1];
    }


}