<template>
<div>
	<div class="header">
		<h1>Melody Library</h1>
		<button v-on:click="newSong" style="margin-left: auto;">New Song</button>
	</div>
	<div class="songs">
		<div class="song" v-for="song in songs" :key="song.id">
			<input class="song-name" v-on:input="editSong(song)" v-model="song.name" placeholder="new song">
			<button class="delete-song" v-on:click="deleteSong(song)">Delete Song</button>
			<button class="add-measure" v-on:click="song.numMeasures++; editSong(song);">+</button>
			<div class="song-box" v-on:click="addNote" v-on:scroll="moveTarget">
				<img class="clef" src="../../public/clef.png">
				<hr class="start-hr" style="top: 35px"/>
				<hr class="start-hr" style="top: calc(35px + 18px)"/>
				<hr class="start-hr" style="top: calc(35px + 36px)"/>
				<hr class="start-hr" style="top: calc(35px + 54px)"/>
				<hr class="start-hr" style="top: 107px;"/>
				<hr class="start-hr" style="width: 1px; height: 72px; top: 35px;"/>
				<hr class="start-hr" style="width: 1px; height: 73px; top: 35px; left: 105px;"/>
				<div class="measures">
					<div class="measure" v-for="index in song.numMeasures" :key="index">
						<hr/>
						<hr/>
						<hr/>
					</div>
					<div v-bind:class="{'note': true, 'selected': (note._id == editNoteID)}" v-bind:style="{ 'top': (35 + ('f'.charCodeAt(0) - note.name.charCodeAt(0)) * 9 + (5 - note.name.charAt(1)) * 63).toString() + 'px', 'left': (25 + note.beat * 50).toString() + 'px'}" v-for="note in song.notes" :key="note._id"></div>
				</div>
			</div>
			<button v-on:click="play(song)">Play</button>
			<button v-on:click="stop(song)">Stop</button>
			<button v-on:click="noteUp()" :disabled="!song.notes.find(x => x._id == editNoteID)" v-bind:class="{ 'disabled' : !song.notes.find(x => x._id == editNoteID)}" style="margin-left: auto;">Up</button>
			<button v-on:click="noteDown()" :disabled="!song.notes.find(x => x._id == editNoteID)" v-bind:class="{ 'disabled' : !song.notes.find(x => x._id == editNoteID)}">Down</button>
			<button v-on:click="noteLeft()" :disabled="!song.notes.find(x => x._id == editNoteID)" v-bind:class="{ 'disabled' : !song.notes.find(x => x._id == editNoteID)}">Left</button>
			<button v-on:click="noteRight()" :disabled="!song.notes.find(x => x._id == editNoteID)" v-bind:class="{ 'disabled' : !song.notes.find(x => x._id == editNoteID)}">Right</button>
			<button v-on:click="deleteNote()" :disabled="!song.notes.find(x => x._id == editNoteID)" v-bind:class="{ 'disabled' : !song.notes.find(x => x._id == editNoteID)}">Delete</button>
		</div>
	</div>
	<div class="note" id="targetNote"></div>
</div>
</template>

<style>
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

.note {
	position: absolute;
	background-color: black;
	width: 24px;
	height: 18px;
	border-radius: 50%;
	transform: translate(-50%, -50%);
}

.selected {
	background-color: #0080ff;
}

.disabled {
	background-color: gray;
}

#targetNote {
	visibility: hidden;
	opacity: .5;
	pointer-events: none;
}

.add-measure {
	border-radius: 20px;
	display: flex;
	font-size: 25px;
	min-width: 30px;
	height: 30px;
	justify-content: center;
	align-items: center;
	margin: 0;
}

.measure {
	height: 100%;
	min-width: 200px;
	border-top: 1px solid black;
	border-right: 1px solid black;
	border-bottom: 1px solid black;
	border-left: none;
	pointer-events: none;
}

.measure hr {
	height: 18px;
	border: none;
	border-bottom: 1px solid black;
	width: 100%;
}

.measures {
	height: 100%;
	width: auto;
	display: flex;
	position: relative;
	padding: 35px 5px 38px 50px;
	pointer-events: none;
}

.start-hr {
	position: absolute;
	border: none;
	left: 5px;
	height: 1px;
	width: 100px;
	background-color: black;
	z-index: 0;
}

.clef {
	width: 50px;
	min-width: 50px;
	position: relative;
	top: -5px;
	height: 130px;
	margin: 15px 0 15px 5px;
}

.song-box {
	position: relative;
	height: 170px;
	width: 100%;
	margin: 5px 0;
	border-radius: 5px;
	border: 1px solid black;
	display: flex;
	overflow-y: hidden;
	overflow-x: scroll;
}

.song {
	display: flex;
	align-items: flex-start;
	flex-wrap: wrap;
	width: 90%;
	height: 255px;
	margin: 30px 20px;
	border-radius: 10px;
	box-shadow: 0 0 30px 0 gray;
	padding: 10px;
}

.song-name {
	margin-right: auto;
	height: 30px;
	font-size: 25px;
	width: calc(100% - 170px);
	border: 1px solid white;
}

.song-name:hover,
.song-name:focus {
	border: 1px solid gray;
	border-radius: 5px;
}

.header{
	background-color: white;
	width: 100%;
	height: 80px;
	border-bottom: 2px solid black;
	position: sticky;
	top: 0;
	z-index: 1;
	display: flex;
	align-items: center;
	padding: 0 30px;
}

button {
	height: 30px;
	background-color: #0080ff;
	border-radius: 5px;
	color: white;
	padding: 0 5px;
	white-space: nowrap;
}
</style>

<script>
// @ is an alias to /src
import axios from 'axios';

export default {
	name: 'MelodyLibrary',
	data() {
		return {
			songs: [],
			mousePos: '',
			editSongIndex: 0,
			editBeat: 0,
			editNoteName: '',
			editNoteID: '',
		}
	},
	created() {
		this.getSongs();
		this.getNotes();
		window.addEventListener("mousemove", this.moveTarget);
	},
	methods: {
		async getSongs() {
			try {
				let response = await axios.get("/api/songs");
				this.songs = response.data.reverse();
				return true;
			} catch (error) {
				console.log(error);
			}
		},
		async getNotes() {
			try {
				let response = await axios.get("/api/notes");
				for (var i = 0; i < this.songs.length; i++) {
					this.songs[i].notes = response.data.filter(x => x.songID == this.songs[i]._id);
				}
				return true;
			} catch (error) {
				console.log(error);
			}
		},
		async newSong() {
			try {
				let response = await axios.post('/api/songs');
				this.songs.splice(0,0,response.data);
			} catch (error) {
				console.log(error);
			}	
		},
		async deleteSong(song) {
			try {
				await axios.delete("/api/songs/" + song._id);
				this.songs = this.songs.filter( x => x._id != song._id);
				return true;
			} catch (error) {
				console.log(error);
			}
		},
		async editSong(song) {
			try {
				await axios.put("/api/songs/" + song._id, {
					name: song.name,
					numMeasures: song.numMeasures,
				});
				return true;
			} catch (error) {
				console.log(error);
			}
		},
		moveTarget(e) {
			if (e.type == "mousemove") {
				this.mousePos = {x: e.pageX, y: e.pageY};
			}
			if ((this.mousePos.y - 154) % 285 < 170 && this.mousePos.y >= 154 && this.mousePos.x > 30 && this.mousePos.x < document.body.clientWidth - 30) {
				document.getElementById("targetNote").style.visibility = "visible";
				this.editSongIndex = Math.floor((this.mousePos.y - 154) / 285);

				//set vertical note position and note name
				var mouseY = (this.mousePos.y - 154) % 285;
				if (mouseY < 43) {
					this.mousePos.y = 154 + this.editSongIndex * 285 + 38;
					this.editNoteName = 'f5';
				}
				else if (mouseY > 105) {
					this.mousePos.y = 154 + this.editSongIndex * 285 + 109;
					this.editNoteName = 'e4';
				}
				else {
					this.mousePos.y = 192 + this.editSongIndex * 285 + Math.floor((mouseY - 33) / 9) * 9;
					this.editNoteName = String.fromCharCode('f'.charCodeAt(0) - Math.floor((mouseY - 33) / 9)) + '5';
					if (this.editNoteName.charAt(0) < 'a') {
						this.editNoteName = String.fromCharCode(this.editNoteName.charCodeAt(0) + 7) + '4';
					}
					else if (this.editNoteName > 'f') {
						this.editNoteName = String.fromCharCode(this.editNoteName.charCodeAt(0) - 7) + '5';
					}
				}
				document.getElementById("targetNote").style.top = this.mousePos.y.toString() + "px";

				//set horizontal note position and note beat
				var scrollX = document.getElementsByClassName("song-box")[this.editSongIndex].scrollLeft;
				var mouseX = this.mousePos.x + scrollX - 135;
				this.editBeat = Math.floor(mouseX / 50) + 1;
				if (this.editBeat < 1) {
					this.editBeat = 1;
				}
				else if (this.editBeat > this.songs[this.editSongIndex].numMeasures * 4) {
					this.editBeat = this.songs[this.editSongIndex].numMeasures * 4;
				}
				mouseX = 110 - scrollX + this.editBeat * 50;
				if (mouseX > 30 && mouseX < document.body.clientWidth - 30) {
					document.getElementById("targetNote").style.left = (110 - scrollX + this.editBeat * 50).toString() + "px";
				}
				else {
					document.getElementById("targetNote").style.visibility = "hidden";
				}
			}
			else {
				document.getElementById("targetNote").style.visibility = "hidden";
			}
		},
		async addNote() {
			try {
				var note = {
					name: this.editNoteName,
					beat: this.editBeat,
					songID: this.songs[this.editSongIndex]._id,
				};
				var editNote = this.songs[this.editSongIndex].notes.find(x => x.name == this.editNoteName && x.beat == this.editBeat);
				if (editNote) {
					this.editNoteID = editNote._id;
				}
				else {
					var response = await axios.post("/api/notes/", note);
					this.songs[this.editSongIndex].notes.push(response.data);
					this.editNoteID = response.data._id;
				}
				return true;
			} catch (error) {
				console.log(error);
			}
		},
		noteUp() {
			console.log("worked");
		},
	},
}
</script>
