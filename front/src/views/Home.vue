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
					<div v-bind:class="{'note': true, 'selected': (note._id == editNote._id)}" v-bind:style="{ 'top': (35 + ('f'.charCodeAt(0) - note.name.charCodeAt(0)) * 9 + (note.name.charAt(0) <= 'b' && note.name.charAt(1) == 4 ? 0 : 5 - note.name.charAt(1)) * 63).toString() + 'px', 'left': (25 + note.beat * 50).toString() + 'px'}" v-for="note in song.notes" :key="note._id"></div>
				</div>
			</div>
			<button v-on:click="play(song)">Play</button>
			<button v-on:click="noteUp()" :disabled="!song.notes.find(x => x._id == editNote._id)" v-bind:class="{ 'disabled' : !song.notes.find(x => x._id == editNote._id)}" style="margin-left: auto;">Up</button>
			<button v-on:click="noteDown()" :disabled="!song.notes.find(x => x._id == editNote._id)" v-bind:class="{ 'disabled' : !song.notes.find(x => x._id == editNote._id)}">Down</button>
			<button v-on:click="noteLeft()" :disabled="!song.notes.find(x => x._id == editNote._id)" v-bind:class="{ 'disabled' : !song.notes.find(x => x._id == editNote._id)}">Left</button>
			<button v-on:click="noteRight()" :disabled="!song.notes.find(x => x._id == editNote._id)" v-bind:class="{ 'disabled' : !song.notes.find(x => x._id == editNote._id)}">Right</button>
			<button v-on:click="deleteNote()" :disabled="!song.notes.find(x => x._id == editNote._id)" v-bind:class="{ 'disabled' : !song.notes.find(x => x._id == editNote._id)}">Delete</button>
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
import * as Tone from "tone";

export default {
	name: 'MelodyLibrary',
	data() {
		return {
			songs: [],
			mousePos: '',
			targetSongIndex: 0,
			targetBeat: 0,
			targetNoteName: '',
			editNote: '',
		}
	},
	created() {
		this.getSongs();
		this.getNotes();
		window.addEventListener("mousemove", this.moveTarget);
		window.addEventListener("keydown", event => {
			if (event.code == "ArrowUp") {
				event.preventDefault();
				this.noteUp();
			}
			else if (event.code == "ArrowDown") {
				event.preventDefault();
				this.noteDown();
			}
			else if (event.code == "ArrowLeft") {
				this.noteLeft();
			}
			else if (event.code == "ArrowRight") {
				this.noteRight();
			}
			else if (event.code == "Delete" || event.code == "Backspace") {
				this.deleteNote();
			}
		});
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
				this.editNote = '';
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
			if (Math.floor((this.mousePos.y - 154) / 285) < this.songs.length && (this.mousePos.y - 154) % 285 < 170 && this.mousePos.y >= 154 && this.mousePos.x > 30 && this.mousePos.x < document.body.clientWidth - 30) {
				document.getElementById("targetNote").style.visibility = "visible";
				this.targetSongIndex = Math.floor((this.mousePos.y - 154) / 285);

				//set vertical note position and note name
				var mouseY = (this.mousePos.y - 154) % 285;
				if (mouseY < 43) {
					this.mousePos.y = 154 + this.targetSongIndex * 285 + 38;
					this.targetNoteName = 'f5';
				}
				else if (mouseY > 105) {
					this.mousePos.y = 154 + this.targetSongIndex * 285 + 109;
					this.targetNoteName = 'e4';
				}
				else {
					this.mousePos.y = 192 + this.targetSongIndex * 285 + Math.floor((mouseY - 33) / 9) * 9;
					this.targetNoteName = String.fromCharCode('f'.charCodeAt(0) - Math.floor((mouseY - 33) / 9));
					if (this.targetNoteName.charAt(0) < 'a') {
						this.targetNoteName = String.fromCharCode(this.targetNoteName.charCodeAt(0) + 7);
					}
					else if (this.targetNoteName > 'f') {
						this.targetNoteName = String.fromCharCode(this.targetNoteName.charCodeAt(0) - 7);
					}
					if (mouseY > 68) {
						this.targetNoteName += '4';
					}
					else {
						this.targetNoteName += '5';
					}
				}
				document.getElementById("targetNote").style.top = this.mousePos.y.toString() + "px";

				//set horizontal note position and note beat
				var scrollX = document.getElementsByClassName("song-box")[this.targetSongIndex].scrollLeft;
				var mouseX = this.mousePos.x + scrollX - 135;
				this.targetBeat = Math.floor(mouseX / 50) + 1;
				if (this.targetBeat < 1) {
					this.targetBeat = 1;
				}
				else if (this.targetBeat > this.songs[this.targetSongIndex].numMeasures * 4) {
					this.targetBeat = this.songs[this.targetSongIndex].numMeasures * 4;
				}
				mouseX = 110 - scrollX + this.targetBeat * 50;
				if (mouseX > 30 && mouseX < document.body.clientWidth - 30) {
					document.getElementById("targetNote").style.left = (110 - scrollX + this.targetBeat * 50).toString() + "px";
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
					name: this.targetNoteName,
					beat: this.targetBeat,
					songID: this.songs[this.targetSongIndex]._id,
				};
				var targetNote = this.songs[this.targetSongIndex].notes.find(x => x.name == this.targetNoteName && x.beat == this.targetBeat);
				if (targetNote) {
					this.editNote = targetNote;
				}
				else {
					var response = await axios.post("/api/notes/", note);
					this.songs[this.targetSongIndex].notes.push(response.data);
					this.editNote = response.data;
				}
				return true;
			} catch (error) {
				console.log(error);
			}
		},
		async noteUp() {
			try {
				if (this.editNote != '') {
					var newName = String.fromCharCode(this.editNote.name.charCodeAt(0) + 1);
					if (newName.charAt(0) > 'g') {
						newName = String.fromCharCode(newName.charCodeAt(0) - 7);
					}
					if (newName.charAt(0) == 'c') {
						newName += '5';
					}
					else {
						newName += this.editNote.name.charAt(1);
					}
					if (newName.charAt(1) > '5' || (newName.charAt(1) == '5' && newName.charAt(0) > 'f')) {
						newName = 'f5';
					}
					this.editNote.name = newName;
					await axios.put("/api/notes/" + this.editNote._id, {
						name: newName,
						beat: this.editNote.beat,
					});
				}
				return true;
			} catch (error) {
				console.log(error);
			}
		},
		async noteDown() {
			try {
				if (this.editNote != '') {
					var newName = String.fromCharCode(this.editNote.name.charCodeAt(0) - 1);
					if (newName.charAt(0) < 'a') {
						newName = String.fromCharCode(newName.charCodeAt(0) + 7);
					}
					if (newName.charAt(0) == 'b') {
						newName += '4';
					}
					else {
						newName += this.editNote.name.charAt(1);
					}
					if (newName.charAt(1) == '4' && newName.charAt(0) == 'd') {
						newName = 'e4';
					}
					this.editNote.name = newName;
					await axios.put("/api/notes/" + this.editNote._id, {
						name: newName,
						beat: this.editNote.beat,
					});
				}
				return true;
			} catch (error) {
				console.log(error);
			}
		},
		async noteLeft() {
			try {
				if (this.editNote != '') {
					var newBeat = this.editNote.beat - 1;
					if (newBeat < 1) {
						newBeat = 1;
					}
					this.editNote.beat = newBeat;
					await axios.put("/api/notes/" + this.editNote._id, {
						name: this.editNote.name,
						beat: newBeat,
					});
				}
				return true;
			} catch (error) {
				console.log(error);
			}
		},
		async noteRight() {
			try {
				if (this.editNote != '') {
					var newBeat = this.editNote.beat + 1;
					if (newBeat > this.songs.find(x => x._id == this.editNote.songID).numMeasures * 4) {
						newBeat = this.songs.find(x => x._id == this.editNote.songID).numMeasures * 4;
					}
					this.editNote.beat = newBeat;
					await axios.put("/api/notes/" + this.editNote._id, {
						name: this.editNote.name,
						beat: newBeat,
					});
				}
				return true;
			} catch (error) {
				console.log(error);
			}
		},
		async deleteNote() {
			try {
				if (this.editNote != '') {
					await axios.delete("/api/notes/" + this.editNote._id);
					this.songs.find(x => x._id == this.editNote.songID).notes = this.songs.find(x => x._id == this.editNote.songID).notes.filter( x => x._id != this.editNote._id);
					this.editNote = '';
				}
				return true;
			} catch (error) {
				console.log(error);
			}
		},
		async play(song) {
			try {
				Tone.Transport.bpm.value = 100;
				Tone.Transport.stop();
				Tone.Transport.position = 0;
				Tone.Transport.cancel();


				let polySynth = new Tone.PolySynth(9,Tone.Synth).toMaster();
				var notes = song.notes.sort((a, b) => (a.beat > b.beat) ? 1 : -1);
				var i = 0;
				var beat = 1;
				var chords = [];
				var currentNotes = [];
				while (i < notes.length) {
					currentNotes = [];
					beat = notes[i].beat;
					while (i < notes.length && notes[i].beat == beat) {
						currentNotes.push(notes[i].name);
						i++;
					}
					if (currentNotes.length > 0) {
						chords.push({
							notes: currentNotes,
							beat: beat,
						});
					}
				}
				Tone.Transport.schedule(function() {
					for (const chord of chords) {
						polySynth.triggerAttackRelease(chord.notes,'8n',"+0:" + chord.beat);
					}
				}, 0);
				Tone.Transport.start();
			} catch (error) {
				console.log(error);
			}
		}
	},
}
</script>
