const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const port = process.env.port || 5000

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.json())
app.use(cors(
  {
      origin: ['http://localhost:5173',
        'https://assignmnet-12-b8c69.web.app',
        'https://assignmnet-12-b8c69.firebaseapp.com',
        'https://travelbloombd.netlify.app'
      ],
      credentials: true
  }
));



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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

const touristSpotCollection = client.db("touristSpotDB").collection("touristSpot");
const userCollection = client.db("touristSpotDB").collection("users");
const tourGuidesCollection = client.db("touristSpotDB").collection("tourGuide");
const touristStoryCollection = client.db("touristSpotDB").collection("touristStory");
const touristFormCollection = client.db("touristSpotDB").collection("touristForm");
const wishlistCollection = client.db("touristSpotDB").collection("wishlist");




app.post('/jwt', async(req,res)=>{
  const user = req.body;
  const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
    expiresIn: '1h',
   
  })
  res.send({token})
 })


 const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken; 
  console.log(token)
  if (!token) {
      return res.status(401).send({ message: 'Unauthorized access' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).send({ message: 'Unauthorized access' });
      }
      req.decoded = decoded;
      next();
  });
};


app.get('/users',verifyToken,async (req, res) => {
  console.log(req.headers.Authorization)
    const result = await userCollection.find().toArray();
    res.send(result);
});
app.get('/users/:email', async (req, res) => {
  const email = req.params.email;
  const user = await userCollection.findOne({ email });
  if (user) {
      res.send(user);
  } else {
      res.status(404).send({ message: 'User not found' });
  }
});

app.get('/users/admin/:email',verifyToken,async (req,res)=>{
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
    tourGuide = user?.role === 'tourGuide'
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
  const result = await touristSpotCollection.find().toArray()
  res.send(result)
})
app.get('/wishlist',async(req,res)=>{
  const email = req.query.email;
  const query = { email: email };
  const result = await wishlistCollection.find(query).toArray()
  res.send(result)
})
app.get('/touristForm',async(req,res)=>{
  const {email,guide_email} = req.query;
  console.log(req.headers)
  const query = {};
  if (email) query.email = email;
  if (guide_email) query.guide_email = guide_email;
  const result = await touristFormCollection.find(query).toArray()
  res.send(result)
})

app.get('/touristSpot/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await touristSpotCollection.findOne(query);
  res.send(result);
})
app.post('/touristForm',async(req,res)=>{
  const item = req.body;
  const result = await touristFormCollection.insertOne(item);
  res.send(result);
})
app.post('/touristSpot',async(req,res)=>{
  const item = req.body;
  const result = await touristSpotCollection.insertOne(item);
  res.send(result);
})
app.post('/touristStory', async(req,res)=>{
  const item = req.body;
  const result = await touristStoryCollection.insertOne(item);
  res.send(result);
})
app.post('/tourGuides',async(req,res)=>{
  const item = req.body;
  const result = await tourGuidesCollection.insertOne(item);
  res.send(result);
})
app.post('/wishlist',async(req,res)=>{
  const item = req.body;
  const result = await wishlistCollection.insertOne(item);
  res.send(result);
})


app.get('/tourGuides',async(req,res)=>{
  const result = await tourGuidesCollection.find().toArray()
  res.send(result)
})
app.get('/tourGuides/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await tourGuidesCollection.findOne(query);
  res.send(result);
})
app.get('/touristStory',async(req,res)=>{
  const result = await touristStoryCollection.find().toArray()
  res.send(result)
})
app.get('/touristStory/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await touristStoryCollection.findOne(query);
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
    const user = await userCollection.findOne(filter);
    const existingTourGuide = await tourGuidesCollection.findOne({ email: user?.email });

    if (existingTourGuide) {
      return res.status(400).send({ success: false, message: "User is already a tour guide" });
    }
    const updatedDoc = {
      $set: {
        role: 'tourGuide'
      }
    }
    const result = await userCollection.updateOne(filter, updatedDoc);
    if (result.modifiedCount > 0) {
      const tourGuideData = {
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || null, 
        phone: user.phone || null,
        education: user.education || null,
        address: user.address || null,
        skills: user.skills || null,
        position: user.position || null,
        company: user.company || null,
        years: user.years || null,
        
      };

      const tourGuideResult = await tourGuidesCollection.insertOne(tourGuideData);
      if (tourGuideResult.insertedId) {
        return res.send({
          success: true,
          message: "User promoted to tourGuide and added to tourGuidesCollection.",
        });
      } 
    }
}
)

app.patch('/users/request-guide', async (req, res) =>{
  const { email } = req.body;
  const result = await userCollection.updateOne(
      { email },
      { $set: { role: 'requested' } }
  );
  res.send(result);
})

app.patch('/touristForm/:id',async(req,res)=>{
  const id = req.params.id;
  const {status} = req.body;
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        status,
      }
    }
    const result = await touristFormCollection.updateOne(filter, updatedDoc);
    res.send(result);
})

app.delete('/touristForm/:id',async(req,res)=>{
  const id = req.params.id
  const query = { _id: new ObjectId(id) };
  const result = await touristFormCollection.deleteOne(query);
  res.send(result)
})
app.delete('/wishlist/:id',async(req,res)=>{
  const id = req.params.id
  const query = { _id: new ObjectId(id) };
  const result = await wishlistCollection.deleteOne(query);
  res.send(result)
})
app.delete('/users/:id',async(req,res)=>{
  const id = req.params.id
  const query = { _id: new ObjectId(id) };
  const result = await userCollection.deleteOne(query);
  res.send(result)
})




app.get('/',(req,res) => {
    res.send('boss is sitting')
  })
  
  app.listen(port,()=>{
      console.log('it was worked')
  })