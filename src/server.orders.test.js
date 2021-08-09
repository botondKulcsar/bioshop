const mongoose = require('mongoose');
const config = require('config');
const Order = require('./models/order.model');
const Product = require('./models/product.model');
const Customer = require('./models/customer.model');

const supertest = require('supertest');
const app = require('./server');



const { dbType, username, password, host } = config.get('database');

describe('REST API /api/orders integration tests', () => {
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