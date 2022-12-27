// mongodb connect
const mongoose = require('mongoose');

mongoose.connect('mongodb://0.0.0.0:27017/KeysDB');
// mongoose.connect('mongodb+srv://keys.bcwtduy.mongodb.net/myFirstDatabase" --apiVersion 1 --username Farisrs');
// mongoose.connect('mongodb+srv://Farisrs:qwerty12345@keys.bcwtduy.mongodb.net/Keys')
            
// mongoose.connect("mongodb+srv://safwan_pklr:IoQteMvXR18SeM6u@cluster0.szlgm8q.mongodb.net/CarWorld?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true")
const db = mongoose.connection;
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

// mongodb+srv://safwan_pklr:IoQteMvXR18SeM6u@cluster0.szlgm8q.mongodb.net/CarWorld

