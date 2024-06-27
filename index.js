const express = require('express')
const cors = require('cors')
const app = express()
require("dotenv").config();
const port = process.env.PORT || 5000 ;

//Middleware 
app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tts22yk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const database = client.db("coffeeDB");
    const coffeeHouse = database.collection("Coffee");
    const database2 = client.db("CoffeeUserDB");
    const userCollection = database2.collection("coffeeUser");

    // Read All users
    app.get('/coffee',async(req,res)=>{
      const cursor = coffeeHouse.find();
      const result = await cursor.toArray();
      res.send(result)
  })

    // Find a single user to Update
    app.get('/coffee/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeHouse.findOne(query);
      res.send(result)
  })

    // Get All Coffee input
    app.post('/coffee',async(req,res)=>{
      const newCoffee = req.body
      console.log('New coffee',newCoffee)
      const result = await coffeeHouse.insertOne(newCoffee); 
      res.send(result)
  })

  // Update single Coffee
  app.put('/coffee/:id',async(req,res)=>{
    const id = req.params.id;
    const updateCoffee = req.body
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const coffee = {
        $set: {
          name:updateCoffee.name,
          quantity:updateCoffee.quantity,
          supplier:updateCoffee.supplier,
          available:updateCoffee.available,
          taste:updateCoffee.taste,
          details:updateCoffee.details,
          photo:updateCoffee.photo,
        },
      };
      const result = await coffeeHouse.updateOne(filter, coffee, options);
      res.send(result)
})

  //Delete Single User
  app.delete('/coffee/:id',async(req,res)=>{
    const id = req.params.id 
    console.log('Please delete from database', id)
    const query = { _id: new ObjectId(id) };
    const result = await coffeeHouse.deleteOne(query)
    res.send(result)
})

  //User related apis , create coffee user in DB
  app.post('/user',async(req,res)=>{
    const newUser = req.body
    console.log('New Coffee User',newUser)
    const result = await userCollection.insertOne(newUser); 
    res.send(result)
})



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res) => {
    res.send('Coffee making server is running')
})

app.listen(port, ()=>{
    console.log(`Coffee server is running on port: ${port}` )
})