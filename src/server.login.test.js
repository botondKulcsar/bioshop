const mongoose = require('mongoose');
const config = require('config');
const Customer = require('./models/customer.model');

const supertest = require('supertest');
const app = require('./server');



const { dbType, username, password, host } = config.get('database');

describe('REST API /api/login integration tests', () => {
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
        await supertest(app)
        .post('/api/register')
        .send(customerData[1])
        .set('Accept', 'application/json')
    });

    // drop DB
    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('POST /api/login valid credentials', async () => {
        const credentials = {
            email: 'beka@beka.com',
            password: '1234'
        }
       
            
        const response = await supertest(app)
            .post('/api/login')
            .send(credentials)
            .expect(200)

        expect(response.body._id).toBeTruthy();
        expect(response.body.firstName).toBe(customerData[1].firstName);
        expect(response.body.lastName).toBe(customerData[1].lastName);
        expect(response.body.email).toBe(customerData[1].email);
        expect(response.body.password).toBe(undefined);
        expect(response.body.address.street).toBe(customerData[1].address.street);
        expect(response.body.address.number).toBe(customerData[1].address.number);
        expect(response.body.address.city).toBe(customerData[1].address.city);
        expect(response.body.address.state).toBe(customerData[1].address.state);
        expect(response.body.address.ZIP).toBe(customerData[1].address.ZIP);
        expect(response.body.phone).toBe(customerData[1].phone);
    })

    test('POST /api/login INVALID credentials', async () => {
       
        const credentials = {
            email: 'beka@beka.com',
            password: 'kitudja'
        }
        const response = await supertest(app)
            .post('/api/login')
            .send(credentials)
            .expect(401)

        expect(response.body).toEqual({
            "hasError": true,
            "message": "Submitted email-password combination is invalid",
        })
    })

})