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
  date: String,
  log: [{}]
});

const Person = new mongoose.model("Person", personSchema);

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  Person.find({username: username}, (err, data) => {
    if(err) console.log(err);
    if(data.length <= 0){
      const newPerson = new Person({username: req.body.username});
      newPerson.save((err, data) => {if(err) console.log(err)});
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

app.post('/api/users/:_id/exercises', (req, res) => {
  let id = req.params._id;
  if(id === undefined) res.send("not found");
  else
    Person.findById(id, (err, personFound) => {
      if(err) console.log(err);
      if(!personFound || !req.body.description || !req.body.duration) res.send("No user found with this _id");
      else {
        const currentDate = new Date().toDateString();
        const newProperties = {
          description: req.body.description,
          duration: req.body.duration,
          date: req.body.date ? new Date(req.body.date).toDateString() : currentDate
        };
        personFound = Object.assign(personFound, newProperties);
        personFound.log.push(newProperties);
        personFound.save((err, data) => {if(err) console.log(err);});
        const newObject = Object.assign({}, personFound)._doc;
        newObject.__v = undefined;
        newObject.log = undefined;
        res.send(newObject);
      }
    });
});

app.get('/api/users/:_id/logs', (req, res) => {
  let id = req.params._id;
  if(id === undefined) res.send('not found');
  else
    Person.findById(id, (err, personFound) => {
      if(err) console.log(err);
      if(!personFound) res.send("No user found with this _id");
      else {
        const newLogs = {
          "_id": id,
          "username": personFound.username,
          "count": personFound.log.length,
          "log": [...personFound.log]
        };
        res.send(newLogs);
      }
    });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
