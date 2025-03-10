const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

app.use(cors({
  origin: 'https://daily-conversation-with-myself.netlify.app/', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const uri = process.env.MONGODB_URI || "your_mongodb_uri";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let usersCollection;
let blogsCollection;

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Get the collections
    const database = client.db('dailylife');
    usersCollection = database.collection('users');
    blogsCollection = database.collection('blogs');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}
run().catch(console.dir);

// Register
app.post('/api/register', async (req, res) => {
  const { fullname, username, password, email } = req.body;
  console.log('Received registration data:', { fullname, username, password, email });
  if (!fullname || !username || !password || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { fullname, username, password: hashedPassword, email };
  try {
    const result = await usersCollection.insertOne(user);
    const token = jwt.sign({ userId: result.insertedId }, SECRET_KEY, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ error: 'Error registering user: ' + error.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await usersCollection.findOne({ username });
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// CRUD operations for blogs
app.get('/api/blogs', async (req, res) => {
  const blogs = await blogsCollection.find().toArray();
  res.json(blogs);
});

app.post('/api/blogs', authenticateToken, async (req, res) => {
  const { title, content, date } = req.body;
  const blog = { title, content, date: new Date(date), userId: new ObjectId(req.user.userId) };
  const result = await blogsCollection.insertOne(blog);
  const insertedBlog = await blogsCollection.findOne({ _id: result.insertedId });
  res.status(201).json(insertedBlog);
});

app.put('/api/blogs/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, date } = req.body;
  console.log('Update request received:', { id, title, content, date });
  const result = await blogsCollection.findOneAndUpdate(
    { _id: new ObjectId(id), userId: new ObjectId(req.user.userId) },
    { $set: { title, content, date: new Date(date) } },
    { returnDocument: 'after' }
  );
  if (!result.value) {
    return res.status(403).send('You do not have permission to edit this blog');
  }
  res.json(result.value);
});

app.delete('/api/blogs/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const result = await blogsCollection.findOneAndDelete({ _id: new ObjectId(id), userId: new ObjectId(req.user.userId) });
  if (!result.value) {
    return res.status(403).send('You do not have permission to delete this blog');
  }
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
