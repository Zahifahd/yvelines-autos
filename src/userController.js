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
app.get("/logout", (req, res) => {
  // Déconnectez l'utilisateur en effaçant ses informations de session
  // Redirigez l'utilisateur vers la page de connexion ou une autre page appropriée
  res.redirect("/login");
});

module.exports = registerUser;