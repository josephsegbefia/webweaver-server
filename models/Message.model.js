const { Schema, model } = require("mongoose");
const { isEmail, isURL } = require("validator");

function emailSchema(opts = {}) {
  const { required } = opts;
  return {
    type: String,
    required: !!required,
    validate: {
      validator: isEmail,
      message: (props) => `${props.value} is not a valid email address`
    }
  };
}

const messageSchema = new Schema({
  senderName: { type: String },
  senderEmail: emailSchema(),
  content: { type: String }
},
{
  timestamps: true
});

module.exports = model("Message", messageSchema);
