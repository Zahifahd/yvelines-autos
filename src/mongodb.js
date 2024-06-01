const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/login", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Mongo connecté à la base de données des utilisateurs");
  })
  .catch((err) => {
    console.log("Connexion échouée à la base de données des utilisateurs", err);
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
  postalcode: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true,
    default: "/uploads-users/default-image.png" // Chemin par défaut pour les images d'utilisateurs
}
});

const collection = mongoose.model("collection1", LoginSchema);
module.exports = collection;
