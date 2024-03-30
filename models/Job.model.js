const mongoose = require("mongoose");
const { Schema, model } = mongoose;


const jobSchema = new Schema({
  companyName: { type: String, required: true},
  position: { type: String, required: true },
  jobDescription: { type: String, required: true },
  appliedDate: { type: String, required: true },
  jobLocation: { type: String },
  status: { type: String, enum: ["Not applied", "Application withdrawn", "Applied", "Initial Call", "Interviewing", "Landed", "Rejected", "No contact"]},
  cv: { type: String },
  coverLetter: { type: String },
  otherDocs: [String],
  portfolio: { type: Schema.Types.ObjectId, ref: 'Portfolio' }
},
{
  timestamps: true
})

module.exports = model("Job", jobSchema);
