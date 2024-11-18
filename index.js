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
const userCollection = client.db("touristSpotDB").collection("users");

app.get('/users',async (req, res) => {
    const result = await userCollection.find().toArray();
    res.send(result);
});

app.get('/users/admin/:email',async (req,res)=>{
  const email = req.params.email;
  const query = {email: email}
  const user = await userCollection.findOne(query)
  let admin = false;
  if(user){
    admin = user?.role === 'admin'
  }
  res.send({admin})
 })

app.get('/users/tourGuide/:email',async (req,res)=>{
  const email = req.params.email;
  const query = {email: email}
  const user = await userCollection.findOne(query)
  let tourGuide = false;
  if(user){
    admin = user?.role === 'tourGuide'
  }
  res.send({tourGuide})
 })



app.post('/users',async(req,res)=>{
  const user = req.body;
  const query = {email: user.email}
  const existedUser = await userCollection.findOne(query);
  if(existedUser){
    return res.send({message: 'user already exists', insertedId: null})
  }
  const result = await userCollection.insertOne(user)
  res.send(result)
})

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


app.patch('/users/admin/:id',async(req,res)=>{
  const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        role: 'admin'
      }
    }
    const result = await userCollection.updateOne(filter, updatedDoc);
    res.send(result);
})
app.patch('/users/tourGuide/:id',async(req,res)=>{
  const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        role: 'tourGuide'
      }
    }
    const result = await userCollection.updateOne(filter, updatedDoc);
    res.send(result);
})




app.get('/',(req,res) => {
    res.send('boss is sitting')
  })
  
  app.listen(port,()=>{
      console.log('it was worked')
  })