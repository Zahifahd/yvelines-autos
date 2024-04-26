    // Import des modules
    const express = require("express");
    const path = require("path");
    const collection = require("./mongodb");
    const bcrypt = require('bcrypt');
    const VenteVoiture = require("./voiture");
    const multer = require("multer");

    // Initialisation de l'application Express
    const app = express();

    // Configuration du moteur de rendu de vue
    const templatePath = path.join(__dirname, "../templates");
    app.set("view engine", "hbs");
    app.set("views", templatePath);

    // Middleware pour servir les fichiers statiques depuis le dossier "public"
    app.use(express.static("public"));

    // Middleware pour parser le corps des requêtes en JSON
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use("/public", express.static(path.join(__dirname, "public"), { "extensions": ["css"] }));
    // Routes pour les différentes pages
    app.get("/login", (req, res) => {
        res.render("login");
    });

    app.get("/inscription", (req, res) => {
        res.render("inscription");
    });
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "templates", "car-details.html"));
    });
    app.get("/home", (req, res) => {
        res.render("home");
    });

    app.get("/support", (req, res) => {
        res.render("support");
    });

    app.get("/datavoiture", (req, res) => {
        res.render("datavoiture");
    });

    app.get("/otp", (req, res) => {
        res.render("otp");
    });

    app.get("/Apropos", (req, res) => {
        res.render("Apropos");
    });

    app.get("/confirmation-vente", (req, res) => {
        res.render("confirmation-vente");
    });

    app.get("/search-results", (req, res) => {
        res.render("search-results");
    });

    // Route POST pour le formulaire d'inscription
    app.post("/inscription", async (req, res) => {
        try {
            const { username, email, phone, password, cin, city, country, postalcode } = req.body;

            // Vérification des champs requis
            if (!username || !email || !phone || !password || !cin || !city || !country || !postalcode) {
                throw new Error("Veuillez remplir tous les champs du formulaire.");
            }

            // Hachage du mot de passe avant l'enregistrement dans la base de données
            const hashedPassword = await bcrypt.hash(password, 10);
            await collection.create({ username, email, phone, password: hashedPassword, cin, city, country, postalcode });

            // Redirection vers la page d'accueil après l'inscription réussie
            res.redirect("/home");
        } catch (error) {
            console.error("Une erreur s'est produite lors de l'inscription :", error);
            res.status(500).send("Une erreur s'est produite lors de l'inscription. Veuillez réessayer.");
        }
    });

    // Route POST pour le formulaire de connexion
    app.post("/login", async (req, res) => {
        try {
            const { name, password } = req.body;

            // Recherche de l'utilisateur dans la base de données
            const user = await collection.findOne({ name });

            if (!user) {
                console.log("Utilisateur non trouvé");
                return res.send("Utilisateur non trouvé");
            }

            // Vérification du mot de passe
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                console.log("Connexion réussie !");
                res.redirect("/home"); // Redirection vers la page d'accueil après la connexion réussie
            } else {
                console.log("Mot de passe incorrect");
                res.send("Mot de passe incorrect");
            }
        } catch (err) {
            console.error("Erreur lors de la connexion :", err);
            res.send("Erreur lors de la connexion");
        }
    });

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, "public/uploads/"); // Dossier de stockage des images
        },
        filename: function (req, file, cb) {
          cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname)); // Nom unique pour chaque image
        },
      });
    const upload = multer({ storage: storage });


    // Route POST pour le formulaire de soumission de voiture
    app.post("/datavoiture", upload.single("image"), async (req, res) => {
        try {
          const { brand, model, year, mileage, price, description, contactName, fuel, gearbox, taxPower, dinPower } = req.body;
      
          if (!brand || !model || !year || !mileage || !price || !description || !contactName || !fuel || !gearbox || !taxPower || !dinPower || !req.file) {
            throw new Error("Veuillez remplir tous les champs du formulaire.");
          }
      
          const newCar = new VenteVoiture({
            brand,
            model,
            year: parseInt(year),
            mileage: parseInt(mileage),
            price: parseInt(price),
            description,
            contactName,
            carCondition: {
              fuel,
              gearbox,
              taxPower: parseInt(taxPower),
              dinPower: parseInt(dinPower),
              image: "/uploads/" + req.file.filename, // Chemin de l'image dans le dossier public/uploads/
            },
          });
      
          await newCar.save();
          res.render("confirmation-vente", { message: "Annonce ajoutée avec succès !" });
        } catch (error) {
          console.error("Erreur lors de la soumission du formulaire :", error);
          res.status(500).send("Erreur lors de la soumission du formulaire. Veuillez réessayer.");
        }
      });
      
    app.get("/search", async (req, res) => {
        try {
            const { brand } = req.query;
            if (!brand) {
                throw new Error("Veuillez saisir une marque pour la recherche.");
            }
    
            const cars = await VenteVoiture.find({ brand: { $regex: new RegExp(brand, "i") } });
    
            // Transformez le chemin de l'image pour chaque voiture
            const carsWithFullImageURLs = cars.map(car => {
                return {
                    ...car.toJSON(),
                    image: `http://localhost:5000${car.image}` // Remplacez http://localhost:5000 par l'URL de votre serveur
                };
            });
    
            res.render("search-results", { cars: carsWithFullImageURLs });
        } catch (error) {
            console.error("Une erreur s'est produite lors de la recherche :", error);
            res.status(500).send("Une erreur s'est produite lors de la recherche. Veuillez réessayer.");
        }
    });
    
    
    // Route pour afficher les détails d'une voiture
app.get("/car-details/:id", async (req, res) => {
    try {
        const carId = req.params.id;
        // Utilisez l'ID pour rechercher la voiture dans la base de données
        const car = await VenteVoiture.findById(carId);
        if (!car) {
            throw new Error("Voiture non trouvée");
        }
        // Affichez les détails de la voiture sur la page de détails
        res.render("car-details", { car });
    } catch (error) {
        console.error("Erreur lors de la recherche des détails de la voiture :", error);
        res.status(404).send("Voiture non trouvée");
    }
});



    // Démarrage du serveur sur le port 5000
    app.listen(5000, () => {
        console.log("Le serveur est en cours d'exécution sur le port 5000");
    });
