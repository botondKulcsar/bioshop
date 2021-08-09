const mongoose = require('mongoose');
const config = require('config');
const Customer = require('./models/customer.model');

const supertest = require('supertest');
const app = require('./server');



const { dbType, username, password, host } = config.get('database');

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