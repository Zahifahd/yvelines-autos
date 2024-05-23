const express = require("express");
const path = require("path");
const bcrypt = require('bcrypt');
const multer = require("multer");
const collection = require("./mongodb"); // Importation du modèle User depuis mongodb.js
const VenteVoiture = require("./voiture"); // Importation du modèle VenteVoiture

// Initialisation d'Express
const app = express();
const templatePath = path.join(__dirname, "../templates");

// Configuration d'Express
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(__dirname, "public"), { extensions: ["css"] }));

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
app.get("/login", (req, res) => res.render("login"));
app.get("/inscription", (req, res) => res.render("inscription"));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "templates", "car-details.html")));
app.get("/home", (req, res) => res.render("home"));
app.get("/support", (req, res) => res.render("support"));
app.get("/datavoiture", (req, res) => res.render("datavoiture"));
app.get("/otp", (req, res) => res.render("otp"));
app.get("/Apropos", (req, res) => res.render("Apropos"));
app.get("/confirmation-vente", (req, res) => res.render("confirmation-vente"));
app.get("/search-results", (req, res) => res.render("search-results"));

app.get("/voitures-disponibles", async (req, res) => {
  try {
    // Récupération de toutes les voitures disponibles dans la base de données MongoDB
    const voituresDisponibles = await VenteVoiture.find();

    // Rendu de la page "voitures-disponibles.hbs" en passant les données des voitures
    res.render("voitures-disponibles", { voitures: voituresDisponibles });
  } catch (error) {
    console.error("Erreur lors de la récupération des voitures disponibles :", error);
    // Renvoi d'une réponse d'erreur avec un code HTTP 500
    res.status(500).send("Erreur lors de la récupération des voitures disponibles. Veuillez réessayer.");
  }
});


app.post("/inscription", async (req, res) => {
  try {
    const { username, email, phone, password, cin, city, country, postalcode } = req.body;

    if (!username || !email || !phone || !password || !cin || !city || !country || !postalcode) {
      throw new Error("Veuillez remplir tous les champs du formulaire.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await collection.create({ username, email, phone, password: hashedPassword, cin, city, country, postalcode });

    res.redirect("/login");
  } catch (error) {
    console.error("Une erreur s'est produite lors de l'inscription :", error);
    res.status(500).send("Une erreur s'est produite lors de l'inscription. Veuillez réessayer.");
  }
});

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

app.get("/car-details/:id", async (req, res) => {
  try {
    const carId = req.params.id;
    const car = await VenteVoiture.findById(carId);

    if (!car) throw new Error("Voiture non trouvée");

    res.render("car-details", { car });
  } catch (error) {
    console.error("Erreur lors de la recherche des détails de la voiture :", error);
    res.status(404).send("Voiture non trouvée");
  }
});
app.get('/get-bmw-cars', async (req, res) => {
  try {
      const bmwCars = await VenteVoiture.find({ brand: 'BMW' });
      res.json(bmwCars);
  } catch (error) {
      console.error('Erreur lors de la récupération des voitures BMW:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des voitures BMW' });
  }
});

// Démarrage du serveur
app.listen(5000, () => console.log("Le serveur est en cours d'exécution sur le port 5000"));
