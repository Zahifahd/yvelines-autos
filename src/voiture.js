const mongoose = require("mongoose");

const VenteVoitureSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    mileage: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    contactName: {
        type: String,
        required: true
    },
    carCondition: {
        firstRegistration: {
            type: Date,
            required: true
        },
        fuel: {
            type: String,
            enum: ["essence", "diesel", "electrique"],
            required: true
        },
        gearbox: {
            type: String,
            enum: ["manuelle", "automatique"],
            required: true
        },
        taxPower: {
            type: Number,
            required: true
        },
        dinPower: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            required: true,
            default: "/uploads/default-image.jpg" // Chemin par défaut pour les images
        }
    }
    
});

const VenteVoiture = mongoose.model("VenteVoiture", VenteVoitureSchema);
module.exports = VenteVoiture;
