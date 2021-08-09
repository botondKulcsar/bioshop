const logger = require('./config/logger');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

require('dotenv').config();
const config = require('config');

const { readFile } = require('fs');
const path = require('path');

const app = require('./server');
const PORT = config.get('port') || 3000;
// const PORT =  3000;

// in order to user Docker
const Product = require('./models/product.model');
const productService = require('./controllers/product/product.service');


// database connection
if (!config.has('database')) {
    logger.error('No database config found.');
    process.exit();
}
const { dbType, username, password, host } = config.get('database');
const connectionString = `${dbType}${username}${password}${host}`
mongoose
    .connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        logger.info('MongoDB connection has been successfully established');
        
           productService.findAll()
                .then((dbData) => {
                    const productsInDB = dbData;
                    if (productsInDB?.length < 9 || productsInDB === null || productsInDB === undefined ) {
                        console.log('DB is EMPTY!');
                        
                        readFile(path.join(__dirname, './test-data/db.json'), 'utf-8', (err, data) => {
                            if (err) {
                                console.log('could not read sample data: ', err);
                                process.exit();
        
                            } else {
                                const sample = JSON.parse(data);
                                Product.insertMany(sample.products)
                                    .then(() => console.log('DB has just been filled with products'))
                                    .catch(err => {
                                        console.error('could not fill DB with products: ', err);
                                        process.exit();
                                    })
                            }
                        });
                        
                    } else {
                        console.log('DB is already FILLED with products')
                    }

                })
                .catch( err => console.log('could not read db content: ', err));
    })
    .catch((err) => {
        logger.error(err);
        process.exit();
    });


app.listen(PORT, () => console.log(`server is listening on http://localhost:${PORT}`))