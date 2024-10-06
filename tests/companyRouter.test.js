const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');  // Import the Express app

beforeAll(async () => {
  const uri = process.env.MONGO_URI;
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.close();  // Make sure the connection is closed properly
});

describe('GET /api/companies/:accountNumber', () => {
  beforeEach(async () => {
    const company = {
      "_id": new mongoose.Types.ObjectId("66ed59116e6aaadef851b73c"),
      "Company Name": "RedFuel Services",
      "Spending Category": "Fuel",
      "Carbon Emissions": 3,
      "Waste Management": 4,
      "Sustainability Practices": 2,
      "Account Number": 1,
      "Summary": "RedFuel Services focuses on retail, specializing in affordable groceries. They invest heavily in sustainable farming but have higher carbon emissions from transportation.",
      "Balance": 50091679758,
      "XP": 87682,
      "Streak": -1
    };
    await mongoose.connection.collection('Companies').insertOne(company);
  });

  afterEach(async () => {
    await mongoose.connection.collection('Companies').deleteMany({});
  });

  it('should return the company data with varying fields and measure response time', async () => {
    const start = Date.now();
    
    const response = await request(app).get('/api/companies/1');
    
    const end = Date.now();
    const responseTime = end - start;  
    
    console.log(`Response time: ${responseTime}ms`);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      "_id": "66ed59116e6aaadef851b73c",
      "Company Name": "RedFuel Services",
      "Spending Category": "Fuel",
      "Carbon Emissions": 3,
      "Waste Management": 4,
      "Sustainability Practices": 2,
      "Account Number": 1,
      "Summary": "RedFuel Services focuses on retail, specializing in affordable groceries. They invest heavily in sustainable farming but have higher carbon emissions from transportation.",
      "Balance": expect.any(Number),
      "XP": expect.any(Number),
      "Streak": expect.any(Number)
    });
    expect(responseTime).toBeLessThan(500); 
  });

  it('should return 404 when the company is not found', async () => {
    const response = await request(app).get('/api/companies/999999');
    
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Company not found');
  });
});
