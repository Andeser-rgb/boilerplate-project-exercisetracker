const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()
const mongoose = require('mongoose');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(bodyParser.urlencoded({extended: false}));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const personSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date
});

const Person = new mongoose.model("Person", personSchema);

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  Person.find({username: username}, (err, data) => {
    if(err) console.log(err);
    if(data.length <= 0){
      const newPerson = new Person({username: req.body.username});
      newPerson.save((err, data) => {console.log(err)});
      res.send(newPerson);
    }
    else res.send({username: data[0].username, _id: data[0]._id});
  });
});

app.get('/api/users', (req, res) => {
  Person.find().exec((err, data) => {
    if(err) console.log(err);
    if(data.length > 0) res.send(data);
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
