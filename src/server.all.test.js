const mongoose = require('mongoose');
const config = require('config');
const Product = require('./models/product.model');
const Customer = require('./models/customer.model');
const Order = require('./models/order.model');
const supertest = require('supertest');
const app = require('./server');

const { dbType, username, password, host } = config.get('database');

describe('REST API /api/products integration tests', () => {
    // some mock data to fill DB with
    const productData = require('./test-data/mockProducts');

    let savedProducts;
     // DB connection
     beforeEach(async () => {
        await mongoose.connect(`${dbType}${username}${password}${host}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        savedProducts = await Product.insertMany(productData);
    });

    // drop DB
    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    test('GET /api/products', async () => {
        // await Product.insertMany(productData);
        const response = await supertest(app).get('/api/products').expect(200);
        // check type and length
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(productData.length);
        // check data
        response.body.forEach((product, index) => {
            expect(product.name).toBe(productData[index].name);
            expect(product.category).toBe(productData[index].category);
            expect(product.price).toBe(productData[index].price);
            expect(product.quantity).toBe(productData[index].quantity);
            expect(product.description).toBe(productData[index].description);
            expect(product.longDescription).toBe(productData[index].longDescription);
        })
    });

    test('GET /api/products/:id', async () => {
        // const savedProducts = await Product.insertMany(productData);
        const id = savedProducts[0]._id.toString();
        const response = await supertest(app).get('/api/products/' + id).expect(200);
        // check type
        expect(typeof (response.body) === 'object').toBeTruthy();
        // check data
        const { name, category, price, quantity, description, longDescription, imageUrl } = response.body;
        expect(name).toBe(productData[0].name);
        expect(category).toBe(productData[0].category);
        expect(price).toBe(productData[0].price);
        expect(quantity).toBe(productData[0].quantity);
        expect(description).toBe(productData[0].description);
        expect(longDescription).toBe(productData[0].longDescription);
        expect(imageUrl).toBe(productData[0].imageUrl);

    })
})

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
});

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

describe('REST API /orders integration tests', () => {
    // some mock data to fill DB with
    const productData = require('./test-data/mockProducts');
    const customerData = require('./test-data/mockCustomers');
    const orderData = require('./test-data/mockOrders');


    let validAccessToken;
    let validCustomerId;
    let spinachId;
    let tomatoId;
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
        

         // insert 2 products into db
         const spinach = await Product.create(productData[0]);
         spinachId = spinach._doc._id;
         const tomato = await Product.create(productData[2]);
         tomatoId = tomato._doc._id;
          // we must put valid id into orderData products objects
        orderData[0].products[0]._id = spinachId;
        orderData[0].products[1]._id = tomatoId;
    });

     // drop DB
     afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });


    test('POST /api/orders valid data', async () => {
       
        // patch newOrder with customerId
        const newOrder = { ...orderData[0], customerId: validCustomerId }

        const response = await supertest(app)
            .post('/api/orders')
            .set('Authorization', 'Bearer ' + validAccessToken)
            .send(newOrder)
            .expect(201);

        expect(response.body.customerId).toBe(validCustomerId.toString());
        expect(response.body.deliveryAddress.firstName).toBe(newOrder.deliveryAddress.firstName);
        expect(response.body.deliveryAddress.lastName).toBe(newOrder.deliveryAddress.lastName);
        expect(response.body.deliveryAddress.street).toBe(newOrder.deliveryAddress.street);
        expect(response.body.deliveryAddress.number).toBe(newOrder.deliveryAddress.number);
        expect(response.body.deliveryAddress.city).toBe(newOrder.deliveryAddress.city);
        expect(response.body.deliveryAddress.state).toBe(newOrder.deliveryAddress.state);
        expect(response.body.deliveryAddress.ZIP).toBe(newOrder.deliveryAddress.ZIP);
        expect(response.body.products[0]._id).toBe(spinachId.toString())
        expect(response.body.products[0].name).toBe(newOrder.products[0].name);
        expect(response.body.products[0].price).toBe(newOrder.products[0].price);
        expect(response.body.products[0].quantity).toBe(newOrder.products[0].quantity);
        expect(response.body.products[1]._id).toBe(tomatoId.toString())
        expect(response.body.products[1].name).toBe(newOrder.products[1].name);
        expect(response.body.products[1].price).toBe(newOrder.products[1].price);
        expect(response.body.products[1].quantity).toBe(newOrder.products[1].quantity);
        expect(response.body.shipping).toBe(newOrder.shipping);
        expect(response.body.total).toBe(newOrder.total);
    });

    test('POST /api/orders INVALID data', async () => {
        const newOrder = JSON.parse(JSON.stringify(orderData[0]));
        newOrder.customerId = null;

        const response = await supertest(app)
            .post('/api/orders')
            .set('Authorization', 'Bearer ' + validAccessToken)
            .send(newOrder)
            .expect(400);

        expect(response.body).toEqual({
            hasError: true,
            message: "Request body is missing required fields"
        });
    });

    test('GET /api/orders by customerId - valid query', async () => {
        const customer1 = await Customer.create(customerData[0]);
        const customer1_id = customer1._doc._id.toString();
        
        orderData[0].customerId = customer1_id;
        orderData[0].date = new Date().toUTCString();

        orderData[2].products[0]._id = tomatoId;
        orderData[2].customerId = validCustomerId;
        orderData[2].date = new Date().toUTCString();

        await Order.insertMany([orderData[0], orderData[2]]);
        const queryString = `?customerId=${validCustomerId}&_sort=createdAt&_order=desc`;
        const result = await supertest(app)
                    .get('/api/orders' + queryString)
                    .set('Authorization', 'Bearer ' + validAccessToken)
                    .expect(200);

        expect(result.body[0].customerId).toBe(validCustomerId);
        expect(result.body[0].deliveryAddress.firstName).toBe(orderData[2].deliveryAddress.firstName);
        expect(result.body[0].deliveryAddress.lastName).toBe(orderData[2].deliveryAddress.lastName);
        expect(result.body[0].deliveryAddress.street).toBe(orderData[2].deliveryAddress.street);
        expect(result.body[0].deliveryAddress.number).toBe(orderData[2].deliveryAddress.number);
        expect(result.body[0].deliveryAddress.city).toBe(orderData[2].deliveryAddress.city);
        expect(result.body[0].deliveryAddress.ZIP).toBe(orderData[2].deliveryAddress.ZIP);
        expect(result.body[0].deliveryAddress.phone).toBe(orderData[2].deliveryAddress.phone);
        expect(result.body[0].products[0]._id).toBe(orderData[2].products[0]._id.toString());
        expect(result.body[0].products[0].name).toBe(orderData[2].products[0].name);
        expect(result.body[0].products[0].price).toBe(orderData[2].products[0].price);
        expect(result.body[0].products[0].quantity).toBe(orderData[2].products[0].quantity);
        expect(result.body[0].shipping).toBe(orderData[2].shipping);
        expect(result.body[0].total).toBe(orderData[2].total);
    });

    test('GET /api/orders by customerId - INVALID query', async () => {
        const newOrder = JSON.parse(JSON.stringify(orderData[0]));
        newOrder.customerId = 'joska';

        const queryString = `?customerId=${newOrder.customerId}&_sort=createdAt&_order=desc`;
        const response = await supertest(app)
                    .get('/api/orders' + queryString)
                    .set('Authorization', 'Bearer ' + validAccessToken)
                    .expect(400);

        expect(response.body).toEqual({
            hasError: true,
            message: 'invalid customerId'
        });
    });

    
})