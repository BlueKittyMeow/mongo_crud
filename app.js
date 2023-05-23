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
    const studentsCollection = client.db("CirculationApp").collection("students");

    const room = await roomsCollection.findOne({ room_number: room_number });
    if (!room) {
      res.status(404).send('Room not found');
      return;
    }

    const studentIds = room.assignees.map(id => ObjectId(id));
    const students = await studentsCollection.find({ _id: { $in: studentIds } }).toArray();

    // Add students data to the room data
    room.students = students;

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

//API endpoint for updating room data
app.put('/api/rooms/number/:room_number', async (req, res) => {
  try {
      const { room_number } = req.params;
      const { room_status, admin_notes, room_notes } = req.body;

      const roomsCollection = client.db("CirculationApp").collection("spaces");
      await roomsCollection.updateOne({ room_number: room_number }, { $set: { room_status, admin_notes, room_notes } });

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

//API endpoint for updating room data
app.put('/api/rooms/number/:room_number', async (req, res) => {
  try {
      const { room_number } = req.params;
      const { room_status, admin_notes, room_notes } = req.body;

      const roomsCollection = client.db("CirculationApp").collection("spaces");
      await roomsCollection.updateOne({ room_number: room_number }, { $set: { room_status, admin_notes, room_notes } });

      res.sendStatus(200);
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
});


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

// API endpoint for adding a new student
app.post('/api/students', async (req, res) => {
  const student = req.body;
  try {
      const studentsCollection = client.db("CirculationApp").collection("students");
      const result = await studentsCollection.insertOne(student);
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
    const roomsCollection = client.db("CirculationApp").collection("spaces");
    const result = await roomsCollection.insertOne(room);
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
    const studentsCollection = client.db("CirculationApp").collection("students");
    let query = {};

    if (type === 'id') {
      query.pratt_id = term;
    } else if (type === 'email') {
      query.email = term;
    } else if (type === 'name') {
      query.$or = [{ first_name: term }, { legal_first_name: term }, { last_name: term }];
    }

    query.enrollment_status_current = true;

    const students = await studentsCollection.find(query).limit(25).toArray();
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
    const roomsCollection = client.db("CirculationApp").collection("spaces");
    const result = await roomsCollection.updateOne({ _id: ObjectId(room_id) }, { $push: { assignees: student_id } });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

app.get('/api/room_types', async (req, res) => {
  try {
    const roomTypesCollection = client.db("CirculationApp").collection("room_types");
    const roomTypes = await roomTypesCollection.find({}).toArray();
    res.json(roomTypes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});







app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
