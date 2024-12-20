const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()
const port = process.env.PORT || 9000
const app = express()

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',

  ],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

console.log(process.env.DB_USER)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kv4807a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    const assginmentCollection = client.db("studybuddy").collection("allassignment");
    const submitCollection = client.db('studybuddy').collection("submitCollection");

    // post all assingments in database
    app.post('/assignments', async (req, res) => {
      const assignment = req.body;
      const result = await assginmentCollection.insertOne(assignment);

      res.send(assignment)
    })

    // get all assingments in database
    app.get('/assignments', async (req, res) => {
      const cursor = await assginmentCollection.find({}).toArray()
      res.send(cursor);
    })

    // delete a date on database
    app.delete('/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assginmentCollection.deleteOne(query);
      res.send(result);
    })


    app.get('/update/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await assginmentCollection.findOne(query);
      console.log(result)
      res.setHeader('Cache-Control', 'no-cache');
      res.send(result);

    })

    // update on data form a database
    app.put('/updateOne/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updateAss = req.body;
        const updateOne = {
          $set: {
            title: updateAss.title,
            date: updateAss.date,
            description: updateAss.description,
            mark: updateAss.mark,
            photourl: updateAss.photourl,
          }
        };
        const result = await assginmentCollection.updateOne(query, updateOne);
        res.json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


    // SUBMIT ASSIGNEMENT 
    app.post('/submitted', async (req, res) => {
      const submit = req.body;
      const result = await submitCollection.insertOne(submit);
      res.json(result);
    })

    // GET SUBMITTED DATA
    app.get('/submitted', async (req, res) => {
      const cursor = submitCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    })

    app.get('/submitted/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await submitCollection.findOne(query);
      res.send(result)
    })

    app.patch('/givemark/:id', async (req, res) => {
      const { id } = req.params;
      const { mark, feedback,status } = req.body;
    
      try {
        const query = { _id: new ObjectId(id) };
        const update = {
          $set: {
            mark,
            feedback,
            status:'complete',
          }
        };
    
        console.log('Query:', query);
        console.log('Update:', update);
    
        const result = await submitCollection.updateOne(query, update);
    
        if (result.modifiedCount > 0) {
          res.status(200).send({ message: 'Marks and feedback updated successfully' });
        } else {
          res.status(404).send({ message: 'Assignment not found' });
        }
      } catch (error) {
        console.error('Error updating marks and feedback:', error);
        res.status(500).send({ message: 'Internal server error' });
      }
    });






    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello from BUDDY Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))
