const fs = require('fs/promises');
const path = require('path');
const express = require('express');
const cors = require('cors'); // Needed so the Vercel frontend can call this server

const app = express();
const PORT = process.env.PORT || 3000; // Render sets PORT via environment variable

const JOKES_FILE = path.join(__dirname, 'jokes.json');
app.use(cors());          // Allow requests from any origin (safe for now)
app.use(express.json());

async function getJokes() {
    const rawText = await fs.readFile(JOKES_FILE, 'utf8');
    return JSON.parse(rawText);
}

async function saveJokes(jokesArr) {
    const textToSave = JSON.stringify(jokesArr, null, 2); // Fixed: was jokesArray (typo)
    await fs.writeFile(JOKES_FILE, textToSave, 'utf-8');
}


app.get('/jokes/random', async (req, res) => {
 try {
 const jokes = await getJokes();
 const randomIndex = Math.floor(Math.random() * jokes.length);
 res.json(jokes[randomIndex]);
 } catch (error) {
 res.status(500).json({ error: 'Could not fetch a joke right now.' });
 }
 });

 app.get('/jokes', async (req, res) => {
 try {
 const jokes = await getJokes();
 res.json(jokes); 
 } catch (error) {
 res.status(500).json({ error: 'Could not fetch jokes right now.' });
 }
 });


app.post('/jokes', async (req, res) => {
 try {
 const { text } = req.body;
 if (!text) {
 // 400 = "you filled out the form incorrectly."
 return res.status(400).json({ error: 'A "text" field is required.' });
 }
 const jokes = await getJokes();
 const newJoke = {
 id: jokes.length > 0 ? jokes[jokes.length - 1].id + 1 : 1,
 text: text,
 };
 jokes.push(newJoke);
 await saveJokes(jokes); // permanently write the updated array
 res.status(201).json(newJoke); // 201 = "Created"
 } catch (error) {
 res.status(500).json({ error: 'Could not save the new joke.' });
 }
 });

app.listen(PORT,()=>{console.log(`Running on http://localhost:${PORT}`)})


