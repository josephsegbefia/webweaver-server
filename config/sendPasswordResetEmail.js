const { createMailTransporter } = require("./transporter.config");

const sendPasswordResetEmail = (user) => {
  const transporter = createMailTransporter();

  const mailOptions = {
    from: '"WebWeavrr" <webweavrr@outlook.com>',
    to: user.email,
    html: `<p>
            Hello 👋 ${user.firstName}, click the link to reset your password
            <a href = https://webweavrr.com/password-reset?passwordResetToken=${user.passwordResetToken}>Reset Password</a>
         </p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Verification sent");
    }
  });
};

module.exports = { sendPasswordResetEmail };
