const mongoose = require("mongoose");
const { Schema, model } = mongoose;


const jobSchema = new Schema({
  companyName: { type: String, required: true},
  postion: { type: String, required: true },
  jobDescription: { type: String, required: true },
  appliedDate: { type: String, required: true },
  jobLocation: { type: String },
  status: { type: String, enum: ["Not applied", "Withdrew application", "Applied", "Initial Call", "Interviewing", "Landed", "Rejected", "No contact"],
  cv: { type: String },
  coverLetter: { type: String },
  otherDocs: [String],
}
}, {
  timestamps: true
})

module.exports = model("Job", jobSchema);
