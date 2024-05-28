// Importations des modules nécessaires
const express = require("express");
const session = require("express-session");
const MongoDBSession = require('connect-mongodb-session')(session);
const path = require("path");
const bcrypt = require('bcrypt');
const multer = require("multer");
const collection = require("./mongodb"); // Importation du modèle User depuis mongodb.js
const VenteVoiture = require("./voiture"); // Importation du modèle VenteVoiture
const Favorite = require('./favorites');
const stripe = require('stripe')('sk_test_51PKzpiBKj8o7hpKq8MaPSprI3xXwYOilZEdRrv2ZigelFCdZQ207KhUoJBx03Qz5TI2pchZ7zoO5CYTXhTvCWuMt005eAQHL8a');

// Initialisation d'Express
const app = express();
const templatePath = path.join(__dirname, "../templates");

// Configuration d'Express
app.set("view engine", "hbs"); // Utilisation de Handlebars comme moteur de template
app.set("views", templatePath); // Définition du dossier des vues
app.use(express.static("public")); // Définition du dossier des fichiers statiques
app.use(express.json()); // Middleware pour gérer les requêtes JSON
app.use(express.urlencoded({ extended: false })); // Middleware pour gérer les requêtes URL encodées
app.use("/public", express.static(path.join(__dirname, "public"), { extensions: ["css"] })); // Middleware pour les fichiers CSS

// Configuration de multer pour la gestion des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads-cars/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Routes

// Route pour afficher le formulaire de connexion
app.get("/login", (req, res) => res.render("login"));

// Route pour afficher le formulaire d'inscription
app.get("/inscription", (req, res) => res.render("inscription"));

// Route pour la page d'accueil
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "templates", "car-details.html")));

// Route pour la page de support
app.get("/support", (req, res) => res.render("support"));

// Route pour la page de données de voiture
app.get("/datavoiture", (req, res) => res.render("datavoiture"));

// Route pour la page de vérification OTP
app.get("/otp", (req, res) => res.render("otp"));

// Route pour la page "À propos"
app.get("/Apropos", (req, res) => res.render("Apropos"));

// Route pour la page de confirmation de vente
app.get("/confirmation-vente", (req, res) => res.render("confirmation-vente"));

// Route pour afficher les résultats de recherche
app.get("/search-results", (req, res) => res.render("search-results"));

// Route pour afficher le panier
app.get("/cart", (req, res) => res.render("cart"));
// Route pour afficher les voitures favorites de l'utilisateur





// Configuration de la session MongoDB
const store = new MongoDBSession({
  uri: 'mongodb://localhost:27017/login',
  collection: 'sessions'
});

// Utilisation de la session avec Express
app.use(session({
  secret: 'key that will sign cookie',
  resave: false,
  saveUninitialized: false,
  store: store
}));

// Middleware pour vérifier l'authentification de l'utilisateur
const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Route pour la page d'accueil après connexion
app.get("/home", isAuth, (req, res) => res.render("home"));

// Route pour la déconnexion
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erreur lors de la déconnexion :", err);
      res.status(500).send("Erreur lors de la déconnexion. Veuillez réessayer.");
    } else {
      res.redirect("/login");
    }
  });
});

// Route pour afficher toutes les voitures disponibles
app.get("/voitures-disponibles", async (req, res) => {
  try {
    const voituresDisponibles = await VenteVoiture.find();
    res.render("voitures-disponibles", { voitures: voituresDisponibles });
  } catch (error) {
    console.error("Erreur lors de la récupération des voitures disponibles :", error);
    res.status(500).send("Erreur lors de la récupération des voitures disponibles. Veuillez réessayer.");
  }
});

// Route pour afficher le paiement réussi
app.get('/paiement-reussi', (req, res) => res.render('paiement-reussi'));

// Route pour afficher le paiement échoué
app.get('/paiement-erreur', (req, res) => res.render('paiement-erreur'));

// Route pour enregistrer un nouvel utilisateur
app.post("/inscription", async (req, res) => {
  try {
    // Récupération des données du formulaire
    const { username, email, phone, password, cin, city, country, postalcode } = req.body;

    // Vérification des champs requis
    if (!username || !email || !phone || !password || !cin || !city || !country || !postalcode) {
      throw new Error("Veuillez remplir tous les champs du formulaire.");
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur dans la base de données
    await collection.create({ username, email, phone, password: hashedPassword, cin, city, country, postalcode });

    // Enregistrement de l'utilisateur dans la session après l'inscription
    req.session.username = username;

    // Redirection vers la page de connexion
    res.redirect("/login");
  } catch (error) {
    console.error("Une erreur s'est produite lors de l'inscription :", error);
    res.status(500).send("Une erreur s'est produite lors de l'inscription. Veuillez réessayer.");
  }
});

// Route pour la connexion de l'utilisateur
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await collection.findOne({ username });

    if (!user) {
      console.log("Utilisateur non trouvé");
      return res.send("Utilisateur non trouvé");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      console.log("Connexion réussie !");
      req.session.isAuth = true;
      req.session.username = username; // Enregistrement de l'utilisateur dans la session
      req.session.userId = user._id; // Enregistrement de l'identifiant de l'utilisateur dans la session
      res.redirect("/home");
    } else {
      console.log("Mot de passe incorrect");
      res.send("Mot de passe incorrect");
    }
  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    res.send("Erreur lors de la connexion");
  }
});
// Route pour soumettre les données d'une nouvelle voiture
app.post("/datavoiture", upload.single("image"), async (req, res) => {
  try {
    // Récupération des données du formulaire
    const { brand, model, year, mileage, price, description, 'contact-name': contactName, 'first-registration': firstRegistration, fuel, gearbox, 'tax-power': taxPower, 'din-power': dinPower } = req.body;

    // Vérification de la présence de tous les champs nécessaires
    const requiredFields = ['brand', 'model', 'year', 'mileage', 'price', 'description', 'contact-name', 'first-registration', 'fuel', 'gearbox', 'tax-power', 'din-power'];
    const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].trim() === '');
    if (missingFields.length > 0 || !req.file) {
      const errorMessage = missingFields.length > 0 ? `Veuillez remplir les champs suivants : ${missingFields.join(', ')}` : "Veuillez ajouter une image.";
      throw new Error(errorMessage);
    }

    // Création d'une nouvelle instance de VenteVoiture avec les données du formulaire
    const newCar = new VenteVoiture({
      brand,
      model,
      year: parseInt(year), // Conversion en nombre pour les champs numériques
      mileage: parseInt(mileage),
      price: parseInt(price),
      description,
      contactName,
      carCondition: {
        firstRegistration: new Date(firstRegistration), // Conversion en objet Date pour la première immatriculation
        fuel,
        gearbox,
        taxPower: parseInt(taxPower),
        dinPower: parseInt(dinPower),
        image: "/uploads-cars/" + req.file.filename // Chemin du fichier image
      }
    });

    // Sauvegarde de la nouvelle voiture dans la base de données
    await newCar.save();

    // Redirection vers la page de confirmation avec un message de succès
    res.render("confirmation-vente", { message: "Annonce ajoutée avec succès !" });
  } catch (error) {
    console.error("Erreur lors de la soumission du formulaire :", error);
    // Renvoi d'une réponse d'erreur avec un code HTTP 500
    res.status(500).render("datavoiture", { error: error.message || "Erreur lors de la soumission du formulaire. Veuillez réessayer." });
  }
});

// Route pour rechercher des voitures par marque
app.get("/search", async (req, res) => {
  try {
    const { brand } = req.query;

    if (!brand) throw new Error("Veuillez saisir une marque pour la recherche.");

    const cars = await VenteVoiture.find({ brand: { $regex: new RegExp(brand, "i") } });
    const carsWithFullImageURLs = cars.map(car => ({
      ...car.toJSON(),
      image: `http://localhost:5000${car.image}`
    }));

    res.render("search-results", { cars: carsWithFullImageURLs });
  } catch (error) {
    console.error("Erreur lors de la recherche :", error);
    res.status(500).send("Erreur lors de la recherche. Veuillez réessayer.");
  }
});

// Middleware pour la sécurité des connexions
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "connect-src * https://api.stripe.com https://*.stripe.com;");
  next();
});

// Route pour afficher les détails d'une voiture en fonction de son ID
// Route pour afficher les détails d'une voiture en fonction de son ID
app.get("/car-details/:carId", async (req, res) => {
  try {
    const carId = req.params.carId;
    if (!carId) {
      throw new Error("L'identifiant de la voiture n'est pas fourni");
    }
    // Récupération des détails de la voiture à partir de son ID
    const car = await VenteVoiture.findById(carId);
    if (!car) {
      throw new Error("Voiture non trouvée");
    }
    // Rendu de la page de détails de la voiture avec les données de la voiture
    res.render("car-details", { car, carJSON: JSON.stringify(car) });
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de la voiture :", error);
    res.status(400).send("Erreur lors de la récupération des détails de la voiture. Veuillez réessayer.");
  }
});

// Route pour ajouter une voiture aux favoris
app.post("/add-to-favorites/:carId", isAuth, async (req, res) => {
  try {
    const userId = req.session.userId; // Supposons que vous stockiez l'ID de l'utilisateur dans la session
    const carId = req.params.carId;

    // Assurez-vous que userId est défini
    if (!userId) {
      throw new Error("L'identifiant de l'utilisateur n'est pas trouvé.");
    }

    // Création de l'objet "Favorite" avec l'ID de l'utilisateur et l'ID de la voiture
    const newFavorite = new Favorite({ user: userId, car: carId });

    // Sauvegarde de l'objet "Favorite" dans la base de données
    await newFavorite.save();

    res.status(200).send("La voiture a été ajoutée aux favoris de l'utilisateur.");
  } catch (error) {
    console.error("Erreur lors de l'ajout de la voiture aux favoris :", error);
    res.status(500).send("Erreur lors de l'ajout de la voiture aux favoris. Veuillez réessayer.");
  }
});

// Route pour créer une session de paiement Stripe pour une voiture spécifique
app.post("/create-checkout-session/:carId", async (req, res) => {
  try {
    const carId = req.params.carId;

    // Création d'une session de paiement avec Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Nom du produit', // Vous pouvez mettre un nom de produit ici si nécessaire
          },
          unit_amount: 5000, // Montant en centimes (par exemple, 50 € * 100)
        },
        quantity: 1, // Quantité de voitures à acheter
      }],
      mode: 'payment',
      success_url: '/paiement-reussi', // URL à rediriger après un paiement réussi
      cancel_url: '/paiement-erreur', // URL à rediriger en cas d'annulation du paiement
    });

    // Retourner l'ID de la session de paiement
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Erreur lors de la création de la session de paiement :", error);
    res.status(500).json({ error: "Erreur lors de la création de la session de paiement" });
  }
});
// Route pour afficher les voitures favorites de l'utilisateur
app.get("/favorites", isAuth, async (req, res) => {
  try {
    const userId = req.session.userId; // Récupération de l'ID de l'utilisateur depuis la session

    // Récupération des voitures favorites de l'utilisateur depuis la base de données
    const favorites = await Favorite.find({ user: userId }).populate('car');

    // Rendu de la page favorites.hbs avec les données des voitures favorites
    res.render("favorites", { favorites });
  } catch (error) {
    console.error("Erreur lors de la récupération des voitures favorites :", error);
    res.status(500).send("Erreur lors de la récupération des voitures favorites. Veuillez réessayer.");
  }
});

// Démarrage du serveur
app.listen(5000, () => console.log("Le serveur est en cours d'exécution sur le port 5000"));

// Exportation du routeur (inutile si vous n'utilisez pas ce fichier comme un module)
module.exports = app;
