process.on('uncaughtException', function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});

require('dotenv').config(); // Loads environment variables from a .env file into process.env

let port;  // Declare port as a global variable

const express = require('express'); // Express.js is a web application framework for Node.js
const Agent = require('socks-proxy-agent'); // Import socks-proxy-agent for SOCKS proxy connection
const { MongoClient } = require('mongodb'); // Import MongoClient from mongodb
const path = require('path'); // Import path module which provides utilities for working with file and directory paths

const app = express();
app.use(express.json()); // Parse incoming request bodies in a middleware before your handlers
app.use(express.static(__dirname)); // Serve static files from the root directory

// Get your QuotaGuard URL from the environment variable
const QGTunnel = process.env.QUOTAGUARDSTATIC_URL;
const agent = new Agent(QGTunnel); // Create a SOCKS proxy agent with the QuotaGuard URL

// Get the MongoDB URI from the environment variable
const uri = process.env.MONGODB_URI;
// Create a MongoDB client with the agent as an option
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  agent // Use the proxy agent in the MongoClient connection
});

async function startServer() {
  try {
    await client.connect(); // Connect to MongoDB using the client
    console.log("Connected to MongoDB");
    port = process.env.PORT || 3000;  // Use the PORT environment variable, or 3000 if PORT is not set
    app.listen(port, () => { // Start the server
      console.log('App is running on http://localhost:' + port);
    });
  } catch (err) {
    console.error(err); // Log any error during connection or server starting
  }
}

startServer(); // Call startServer to start the server


// Helper function to get a collection
function getCollection(name) {
  return client.db("CirculationApp").collection(name);
}


// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// API endpoint for fetching all room data
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await getCollection("spaces").find({}).toArray();
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

    const room = await getCollection("spaces").findOne({ room_number: room_number });
    if (!room) {
      res.status(404).send('Room not found');
      return;
    }

    const studentIds = room.currentAssignees.map(id => new ObjectId(id));
    const students = await getCollection("students").find({ _id: { $in: studentIds } }).toArray();

    // Add students data to the room data
    room.students = students;

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

//API endpoint for updating room data
app.put('/api/rooms/number/:room_number', async (req, res) => {
  try {
    const { room_number } = req.params;
    const { room_status, admin_notes, room_notes, currentAssignees, roomHistory } = req.body;

    await getCollection("spaces").updateOne(
      { room_number: room_number }, 
      { $set: { room_status, admin_notes, room_notes, currentAssignees, roomHistory } }
    );

    res.sendStatus(200);
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
app.get('/api/students/ids/:ids', async (req, res) => {
  try {
    const { ids } = req.params;
    const studentIds = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

    const students = await getCollection("students").find({ pratt_id: { $in: studentIds } }).toArray();

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// API endpoint for adding a new student
app.post('/api/students', async (req, res) => {
  const { first_name, last_name, pratt_id, email, legal_first_name, enrollment_status_current } = req.body;
  const student = {
    first_name,
    last_name,
    pratt_id,
    email,
    legal_first_name,
    enrollment_status_current
  };

  try {
    const result = await getCollection("students").insertOne(student);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// API endpoint for adding a new room
app.post('/api/rooms', async (req, res) => {
  const room = req.body;
  try {
    const result = await getCollection("spaces").insertOne(room);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// API endpoint for searching students
app.get('/api/students/search', async (req, res) => {
  const { type, term } = req.query;
  try {
    let query = {};

    if (type === 'id') {
      query.pratt_id = term;
    } else if (type === 'email') {
      query.email = term;
    } else if (type === 'name') {
      query.$or = [{ first_name: term }, { legal_first_name: term }, { last_name: term }];
    }

    query.enrollment_status_current = true;

    const students = await getCollection("students").find(query).limit(25).toArray();
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// API endpoint for assigning a student to a room
app.put('/api/rooms/:room_id/assignees/:student_id', async (req, res) => {
  const { room_id, student_id } = req.params;
  try {
    const result = await getCollection("spaces").updateOne({ _id: ObjectId(room_id) }, { $push: { currentAssignees: student_id } });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// API endpoint for fetching room types
app.get('/api/room_types', async (req, res) => {
  try {
    const roomTypes = await getCollection("room_types").find({}).toArray();
    res.json(roomTypes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

