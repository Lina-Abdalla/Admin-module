const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Firebase Admin initialization
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Users endpoint
app.get('/users', (req, res) => {
  const maxResults = 100; // Maximum number of users to fetch
  admin.auth().listUsers(maxResults)
    .then((userRecords) => {
      const users = userRecords.users.map((user) => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }));
      res.json(users);
    })
    .catch((error) => {
      console.error('Error listing users:', error);
      res.status(500).send('Internal Server Error');
    });
});


app.delete('/admin/deleteUser/:uid', async (req, res) => {
  // Add authentication and authorization checks here
  const apiKey = req.headers['x-api-key'];

  if (apiKey !== 'AIzaSyA8vydj3oJu9g90W7jVKyjY7NQzvtUUTko') {  // Replace with your actual expected key
    return res.status(403).send('Unauthorized');
  }
  const { uid } = req.params;

   try {
    await admin.auth().deleteUser(uid);
    // Send a JSON response
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    // Send an error in JSON format
    res.status(500).json({ error: 'Error deleting user' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
