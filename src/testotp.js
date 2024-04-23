function sendTestEmail() {
    Email.send({
        SecureToken: "9E4160AF830E8F341ADC1CD43E4305F12210",
        To: "Redaboukir45@gmail.com", // Remplacez par votre adresse email
        From: "redaboy71@gmail.com",
        Subject: "Test email",
        Body: "Ceci est un test d'envoi d'email depuis JavaScript."
    }).then(message => console.log(message));
}

// Appel de la fonction pour envoyer l'email de test
sendTestEmail();
