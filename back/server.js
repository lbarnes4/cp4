const express = require('express');
const bodyParser = require("body-parser");

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/MelodyLibrary', {
	useNewUrlParser: true
});

const noteSchema = new mongoose.Schema({
	name: String,
	beat: Number,
	songID: String,
});
const Note = mongoose.model('Note', noteSchema);

const songSchema = new mongoose.Schema({
	name: String,
	notes: [noteSchema],
	numMeasures: Number,
	tempo: Number,
});
const Song = mongoose.model('Song', songSchema);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

//api definitions go here
app.get('/api/songs', async (req, res) => {
	try {
		let songs = await Song.find();
		res.send(songs);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

app.get('/api/notes', async (req, res) => {
	try {
		let notes = await Note.find();
		res.send(notes);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

app.post('/api/songs', async (req, res) => {
	const song = new Song({
		name: '',
		notes: [],
		numMeasures: 4,
		tempo: 100,
	});
	try {
		await song.save();
		res.send(song);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

app.post('/api/notes', async (req, res) => {
	const note = new Note(req.body);
	try {
		await note.save();
		res.send(note);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

app.delete('/api/songs/:id', async (req, res) => {
	try {
		await Note.deleteMany({
			songID: req.params.id
		});
		await Song.deleteOne({
			_id: req.params.id
		});
		res.sendStatus(200);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

app.delete('/api/notes/:id', async (req, res) => {
	try {
		await Note.deleteOne({
			_id: req.params.id
		});
		res.sendStatus(200);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

app.put('/api/songs/:id', async (req, res) => {
	try {
		let song = await Song.findOne({
			_id: req.params.id
		});
		song.name = req.body.name;
		song.numMeasures = req.body.numMeasures;
		song.tempo = req.body.tempo;
		song.save();
		res.sendStatus(200);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});

app.put('/api/notes/:id', async (req, res) => {
	try {
		let note = await Note.findOne({
			_id: req.params.id
		});
		note.name = req.body.name;
		note.beat = req.body.beat;
		note.save();
		res.sendStatus(200);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
});


app.listen(3000, () => console.log('Server listening on port 3000!'));
