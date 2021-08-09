const express = require('express');
const app = express();
const morgan = require('morgan');
const logger = require('./config/logger');
require('dotenv').config();
// const cors = require('cors');
const path = require('path')

// swagger docs
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/swagger.yaml');

app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const authenticationByJWT = require('./controllers/auth/authenticate');

const staticUrl = path.join(__dirname, '../public/angular');

// routers
const productRouter = require('./controllers/product/product.routes');
const orderRouter = require('./controllers/order/order.routes');
const customerRouter = require('./controllers/customer/customer.routes');
const authRouter = require('./controllers/auth/auth.routes');

app.use(morgan('combined', { stream: logger.stream }))
// app.use(cors());

app.use(express.json());

app.use('/api/', authRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', authenticationByJWT, orderRouter);
app.use('/api/customers', authenticationByJWT, customerRouter);




app.use((err, req, res, next) => {
    logger.error(`ERROR ${err.statusCode}: ${err.message}`);
    res.status(err.statusCode);
    res.json({
        hasError: true,
        message: err.message
    });
});

app.get('*/*', express.static(staticUrl));

app.all('*', function (req, res) {
    res.status(200).sendFile(`${staticUrl}/index.html`, );
    });

module.exports = app;