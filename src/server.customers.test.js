const mongoose = require('mongoose');
const config = require('config');
const Customer = require('./models/customer.model');

const supertest = require('supertest');
const app = require('./server');



const { dbType, username, password, host } = config.get('database');

describe('REST API /api/customers integration tests', () => {
    // mock data to fill DB with
    const customerData = require('./test-data/mockCustomers');

    let validAccessToken;
    let validCustomerId;
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

        const credentials = {
            email: 'beka@beka.com',
            password: '1234'
        }

       const { body: { _id, accessToken } } = await supertest(app)
            .post('/api/login')
            .send(credentials)
            .expect(200)

        validAccessToken = accessToken;
        validCustomerId = _id;
    });

    // drop DB
    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });


    test('PUT /api/customers/:id valid id', async () => {

        const payload = {
            address: {
                street: "Alajos",
                number: "101",
                city: "Csajágaröcsöge"
            }
        };

        const response = await supertest(app)
            .put(`/api/customers/${validCustomerId}`)
            .set('Authorization','Bearer ' + validAccessToken)
            .send(payload)
            .expect(200)

        expect(response.body.address.street).toBe("Alajos");
        expect(response.body.address.number).toBe("101");
        expect(response.body.address.city).toBe("Csajágaröcsöge");

    });

    test('PUT /api/customers/:id INVALID id', async () => {
        await Customer.create(customerData[0]);

        const payload = {
            address: {
                street: "Alajos",
                number: "101",
                city: "Csajágaröcsöge"
            }
        };

        const response = await supertest(app)
            .put(`/api/customers/12`)
            .set('Authorization','Bearer ' + validAccessToken)
            .send(payload)
            .expect(400)

        expect(response.body).toEqual({
            hasError: true,
            message: 'invalid id'
        });

    });

    test('GET /api/customers/:id valid id', async () => {
        
        const response = await supertest(app)
            .get(`/api/customers/${validCustomerId}`)
            .set('Authorization','Bearer ' + validAccessToken)
            .expect(200)

        expect(response.body._id).toBe(validCustomerId.toString());
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

    });

    test('GET /api/customers/:id INVALID id', async () => {
        
        const _id = 'joska';

        const response = await supertest(app)
            .get(`/api/customers/${_id}`)
            .set('Authorization','Bearer ' + validAccessToken)
            .expect(400)

        expect(response.body).toEqual({
            "hasError": true,
            "message": "invalid id",
        })

    });
})