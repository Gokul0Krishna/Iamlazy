import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  company_name: {
    type: String,
    required: true,
  },
  registration_date:{
    type: Date,
    required: true,
  },
  work_period:{
    type: String,
    required: false,
  },
  stiphend:{
    type: String,
    required: false,
  },
  location:{
    type: String,
    required: false,
  },
  company_website:{
    type: String,
    required: false,
  },
  status:{
    type: Boolean,
    required: true,
    default: false,
  }
});

const Email = mongoose.model("Email", emailSchema);

export default Email;