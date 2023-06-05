const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const HttpsProxyAgent = require('https-proxy-agent');

const app = express();
app.use(express.json());
const port = 3000;

// Get your QuotaGuard URL from the environment variable
const QGTunnel = process.env.QUOTAGUARDSTATIC_URL;
const agent = new HttpsProxyAgent(QGTunnel);

// Get the MongoDB URI from the environment variable
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Use the HttpsProxyAgent
  agent
});

async function connectToDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }
}

connectToDB();

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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
