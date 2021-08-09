const mongoose = require('mongoose');
const config = require('config');
const Customer = require('./models/customer.model');

const supertest = require('supertest');
const app = require('./server');



const { dbType, username, password, host } = config.get('database');



describe('REST API /api/register integration tests', () => {
    // mock data to fill DB with
    const customerData = require('./test-data/mockCustomers');

     // DB connection
     beforeEach(async () => {
        await mongoose.connect(`${dbType}${username}${password}${host}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
    });

    // drop DB
    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('POST /api/register VALID data', async () => {
        const response = await supertest(app)
            .post('/api/register')
            .send(customerData[0])
            .set('Accept', 'application/json')
            .expect(201)
       
        expect(response.body.email).toBe(customerData[0].email);
    });

    test('POST /api/register EXISTING email', async () => {
        await Customer.insertMany(customerData);
        const response = await supertest(app)
            .post('/api/register')
            .send(customerData[0])
            .set('Accept', 'application/json')
            .expect(400)
        // check that no _id has been assigned
        expect(typeof (response.body._id)).toBe('undefined');
        // check for error message: 'notUnique' in response body
        expect(response.body).toEqual({
            hasError: true,
            message: 'notUnique'
        });
    });

    test('POST /api/register invalid data', async () => {
        const newCustData = JSON.parse(JSON.stringify(customerData[0]));
        delete newCustData.firstName;
        const response = await supertest(app)
            .post('/api/register')
            .send(newCustData)
            .set('Accept', 'application/json')
            .expect(400)
        // check that no _id has been assigned
        expect(typeof (response.body._id)).toBe('undefined');
        // check for error message: 'Request body is missing required fields' in response body
        expect(response.body).toEqual({
            hasError: true,
            message: 'Request body is missing required fields'
        });
    });

})