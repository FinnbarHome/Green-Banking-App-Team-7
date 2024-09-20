const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = new Schema({
    "Company Name": {
        type: String,
        required: true
    },
    "Spending Category": {
        type: String,
        required: true
    },
    "Carbon Emissions": {
        type: Number,
        required: true
    },
    "Waste Management": {
        type: Number,
        required: true
    },
    "Sustainability Practices": {
        type: Number,
        required: true
    },
    "Account Number": {
        type: Number,
        required: true
    },
    "Summary": {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);
