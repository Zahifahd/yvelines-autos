// userController.js

const User = require("./loginSchema");

async function registerUser(userData) {
  try {
    const newUser = new User(userData);
    const savedUser = await newUser.save();
    console.log("Utilisateur enregistré :", savedUser);
    return savedUser;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);
    throw error;
  }
}

module.exports = registerUser;
