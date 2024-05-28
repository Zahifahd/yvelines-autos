const mongoose = require("mongoose");

const sessions = new mongoose.Schema({
   
});

const VenteVoiture = mongoose.model("VenteVoiture", VenteVoitureSchema);
module.exports = VenteVoiture;
