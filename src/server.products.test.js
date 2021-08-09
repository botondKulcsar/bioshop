const mongoose = require('mongoose');
const config = require('config');
const Product = require('./models/product.model');

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
        const response = await supertest(app)
                            .get('/api/products')
                            .expect(200);
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