const { createMailTransporter } = require('./transporter.config');

const sendVerificationMail = (user) => {
  const transporter = createMailTransporter();

  const mailOptions = {
    from: `"WebWeavrr " <${process.env.EMAIL_ADDRESS}>`,
    to: user.email,
    html: `<p>
              Hello, ${user.firstName}, thank you for signing up to use our services. Please click on the link
              below to verify your account.
              <a href = https.www.webweavrr.com/verify-email?emailToken=${user.emailToken}>Verify Email</a>
          </p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if(error){
      console.log(error);
    }else {
      console.log('Verification sent');
    }
  })
}

module.exports = { sendVerificationMail };
