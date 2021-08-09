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

describe('REST API /api/refresh integration tests', () => {
    // mock data to fill DB with
    const customerData = require('./test-data/mockCustomers');

    let validRefreshToken;
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

       const { body: { refreshToken } } = await supertest(app)
            .post('/api/login')
            .send(credentials)
            .expect(200)

        validRefreshToken = refreshToken;
    });

    // drop DB
    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('POST /api/refresh valid refresh token', async () => {

        const response = await supertest(app)
            .post('/api/refresh')
            .send({ refreshToken: validRefreshToken })
            .expect(200);

        expect(response.body.accessToken).toBeTruthy()
        expect(response.body.accessExpiresAt).toBeTruthy()
            
    })


    test('POST /api/refresh INvalid refresh token', async () => {

        const response = await supertest(app)
            .post('/api/refresh')
            .send({ refreshToken: 'asdfasdfass78f6as798ftas987gf9a6t' })
            .expect(403);

        expect(response.body).toEqual({});
        
    })
})


describe('REST API /api/logout integration tests', () => {
    // mock data to fill DB with
    const customerData = require('./test-data/mockCustomers');

    let validRefreshToken;
     // DB connection
     beforeEach(async () => {
        await mongoose.connect(`${dbType}${username}${password}${host}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        // register a new customer
        await supertest(app)
        .post('/api/register')
        .send(customerData[1])
        .set('Accept', 'application/json')

        const credentials = {
            email: 'beka@beka.com',
            password: '1234'
        }
        // customer login
       const { body: { refreshToken } } = await supertest(app)
            .post('/api/login')
            .send(credentials)
            .expect(200)

        validRefreshToken = refreshToken;
    });

    // drop DB
    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('POST /api/logout valid refresh token', async () => {

        const response = await supertest(app)
            .post('/api/logout')
            .send({ refreshToken: validRefreshToken })
            .expect(200);

        expect(response.body).toEqual({})
            
    })


    test('POST /api/logout INvalid refresh token', async () => {

        const response = await supertest(app)
            .post('/api/logout')
            .send({ refreshToken: 'asdfasdfass78f6as798ftas987gf9a6t' })
            .expect(401);

        expect(response.body).toEqual({
            hasError: true,
            message: 'already logged out'
        });
        
    })
})