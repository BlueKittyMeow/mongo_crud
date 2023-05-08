console.log('Starting app.js');
const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '.')));

// Connect to MongoDB
const uri = "mongodb://localhost:27017"; // Replace with your MongoDB connection URI
const client = new MongoClient(uri);

async function connectToDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }
}

connectToDB();

// API endpoint for fetching room data
app.get('/api/rooms', async (req, res) => {
  try {
    const roomsCollection = client.db("CirculationApp").collection("spaces");
    const rooms = await roomsCollection.find({}).toArray();
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
