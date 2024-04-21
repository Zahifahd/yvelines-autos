const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/login")
  .then(() => {
    console.log("Mongo connecté");
  })
  .catch(() => {
    console.log("Connexion échouée");
  });

const LoginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cin: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  postalcode:{
    type:String,
    required:true
  },
});

const collection = mongoose.model("collection1", LoginSchema);
module.exports = collection;
