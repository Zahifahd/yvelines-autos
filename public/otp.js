function sendOTP(){
    const email = document.getElementById('email');
    const otpverify = document.getElementsByClassName('otpverify')[0];

    // Create a SMTP crendentials that I showed u in my previous video

    // Generating random number as OTP;

    let otp_val = Math.floor(Math.random()*10000);

    let emailbody = `
        <h1>Please Subscribe to Ash_is_Coding</h1> <br>
        <h2>Your OTP is </h2>${otp_val}
    `;

    Email.send({
        SecureToken : "9E4160AF830E8F341ADC1CD43E4305F12210",
        To : email.value,
        From : "redaboy71@gmail.com",
        Subject : "This is the from Ash_is_Coding, Please Subscribe",
        Body : emailbody
    }).then(
        //if success it returns "OK";
      message => {
        if(message === "OK"){
            alert("OTP sent to your email "+email.value);

            // now making otp input visible
            otpverify.style.display = "block";
            const otp_inp = document.getElementById('otp_inp');
            const otp_btn = document.getElementById('otp-btn');

            otp_btn.addEventListener('click', () => {
                // Vérifier si l'OTP saisi correspond à celui généré précédemment
                if (otp_inp.value == otp_val) {
                    // Envoyer une requête AJAX ou utiliser une autre méthode pour valider l'OTP côté serveur
                    // Si l'OTP est valide, effectuer l'action souhaitée (par exemple, authentification réussie)
                    alert("Email address verified. Double authentication successful!");
                } else {
                    // Si l'OTP est invalide, afficher un message d'erreur
                    alert("Invalid OTP. Double authentication failed.");
                }
            });
            
        }
      }
    );

}