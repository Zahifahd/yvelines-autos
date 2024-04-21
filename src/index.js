const express = require("express");
const app = express();
const path = require("path");
const collection = require("./mongodb");
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');

app.use(express.static("public"));
const templatePath = path.join(__dirname, "../templates");
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/inscription", (req, res) => {
    res.render("inscription");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/support", (req, res) => {
    res.render("support");
});

app.get("/otp", (req, res) => {
    res.render("otp");
});


app.post("/inscription", async (req, res) => {
    try {
        const { username, email, phone, password, cin, city, country, postalcode } = req.body;

        if (!username || !email || !phone || !password || !cin || !city || !country || !postalcode) {
            throw new Error("Veuillez remplir tous les champs du formulaire.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await collection.create({ username, email, phone, password: hashedPassword, cin, city, country, postalcode });

        res.render("home");
    } catch (error) {
        console.error("Une erreur s'est produite lors de l'inscription :", error);
        res.status(500).send("Une erreur s'est produite lors de l'inscription. Veuillez réessayer.");
    }
});

app.post("/login", async (req, res) => {
    try {
        const { name, password } = req.body;
        console.log("Nom d'utilisateur:", name);
        console.log("Mot de passe reçu:", password);

        const user = await collection.findOne({ name });

        if (!user) {
            console.log("Utilisateur non trouvé");
            return res.send("Utilisateur non trouvé");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            console.log("Connexion réussie !");
            res.render("home");
        } else {
            console.log("Mot de passe incorrect");
            res.send("Mot de passe incorrect");
        }
    } catch (err) {
        console.error("Erreur lors de la connexion:", err);
        res.send("Erreur lors de la connexion");
    }
});



app.listen(5000, () => {
    console.log("Le serveur est en cours d'exécution sur le port 5000");
});
