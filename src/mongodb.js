const mongoose = require("mongoose");

// Configuration de la connexion MongoDB
mongoose.connect('mongodb://localhost:27017/login', {
  useNewUrlParser: true, // Utiliser l'analyseur d'URL nouvellement intégré
  useUnifiedTopology: true // Utiliser la topologie unifiée nouvellement intégrée 
}).then(() => {
  console.log("Mongo est pret ");
}).catch((err) => {
  console.error("Erreur lors de la connexion à MongoDB :", err);
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
  },
  resetLink: {
    type: String // Définir le type comme une chaîne de caractères
  }
});

const User = mongoose.model("User", LoginSchema);
module.exports = User; // Export the User model
