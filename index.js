const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.port || 5000

app.use(express.json())
app.use(cors())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dr9an2m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

const touristSpotCollection = client.db("touristSpotDB").collection("touristSpot");


app.get('/touristSpot',async(req,res)=>{
  const cursor = touristSpotCollection.find()
  const result = await cursor.toArray()
  res.send(result)
})
app.get('/touristSpot/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await touristSpotCollection.findOne(query);
  res.send(result);
})
app.post('/touristSpot',async(req,res)=>{
  const item = req.body;
  const result = await touristSpotCollection.insertOne(item);
  res.send(result);
})





app.get('/',(req,res) => {
    res.send('boss is sitting')
  })
  
  app.listen(port,()=>{
      console.log('it was worked')
  })