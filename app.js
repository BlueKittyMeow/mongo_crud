const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
app.use(express.json());
const port = 3000;

// Connect to MongoDB
const uri = "mongodb://localhost:27017";
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

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

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

// API endpoint for fetching room data by room number
app.get('/api/rooms/number/:room_number', async (req, res) => {
  try {
    const { room_number } = req.params;
    const roomsCollection = client.db("CirculationApp").collection("spaces");
    const room = await roomsCollection.findOne({ room_number: room_number });
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});


// Check if a string is a valid ObjectId
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}


// API endpoint for fetching student data by IDs
app.post('/api/students', async (req, res) => {
  console.log('Inside /api/students endpoint');
  try {
    const { ids } = req.body;
    const studentIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
    const studentsCollection = client.db("CirculationApp").collection("students");
    const students = await studentsCollection.find({ pratt_id: { $in: studentIds } }).toArray();

    console.log("Student IDs:", studentIds);
    console.log("Students:", students);

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status
  }
});



app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
