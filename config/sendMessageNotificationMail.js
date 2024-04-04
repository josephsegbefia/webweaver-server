const { createMailTransporter } = require('./transporter.config');

const sendMessageNotificationMail = (user, senderName, senderEmail, subject, content) => {
  const transporter = createMailTransporter();

  const mailOptions = {
    from: `"WebWeavrr " <${process.env.EMAIL_ADDRESS}>`,
    to: user.email,
    html: `<p>
              Hello, ${user.firstName}, you have received a new message from someone who visited your portfolio.
              <hr />
              <p>Name: ${senderName}</p>
              <p>Email: ${senderEmail}</p>
              <p>Subject: ${subject}</p>
              <p>Message: ${content}</p>
          </p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if(error){
      console.log(error);
    }else {
      console.log('Email sent');
    }
  })
}

module.exports = { sendMessageNotificationMail };
