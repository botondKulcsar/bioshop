const orderController = require("./order.controller");
const createError = require("http-errors");
const { mockRequest, mockResponse } = require("jest-mock-req-res");

const orderService = require('./order.service');
jest.mock('./order.service');

describe("OrderController tests", () => {
  const mockOrders = [
    {
      id: 1,
      date: "Sat, 24 Jul 2021 10:07:58 GMT",
      customerId: 1,
      deliveryAddress: {
        firstName: "Botond",
        lastName: "Kulcsár",
        phone: "+36000000001",
        street: "Olajos",
        number: "1",
        ZIP: "6723",
        city: "Szeged",
      },
      products: [
        {
          _id: "60f7e2ac78c55b330d99ad96",
          name: "Spinach",
          price: 2.5,
          quantity: 1,
        },
        {
          _id: "60f7e2ac78c55b330d99ad97",
          name: "Bread",
          price: 3.1,
          quantity: 1,
        },
      ],
      total: 5.6,
      shipping: 10
    },
    {
      id: 2,
      date: "Wed, 21 Jul 2021 10:42:08 GMT",
      customerId: 1,
      deliveryAddress: {
        firstName: "Botond",
        lastName: "Kulcsár",
        phone: "+36000000002",
        street: "Olajos",
        number: "4",
        ZIP: "6723",
        city: "Szeged",
      },
      products: [
        {
          _id: "60f7e2ac78c55b330d99ad97",
          name: "Bread",
          price: 3.1,
          quantity: 1,
        },
      ],
      total: 3.1,
      shipping: 10
    },
    {
      id: 7,
      date: "Sat, 24 Jul 2021 22:11:11 GMT",
      customerId: 2,
      deliveryAddress: {
        firstName: "Zsolti",
        lastName: "Abeka",
        phone: "01234566778",
        street: "Petofi Sandor",
        number: "12",
        ZIP: "112",
        city: "Ozd",
      },
      products: [
        {
          _id: "60f7e2ac78c55b330d99ad9b",
          name: "Milk",
          price: 2.7,
          quantity: 1,
        },
        {
          _id: "60f7e2ac78c55b330d99ad9c",
          name: "Butter",
          price: 4,
          quantity: 2,
        },
      ],
      total: 10.7,
      shipping: 10
    },
  ];

  let response;
  let nextFunction;

  beforeEach(() => {
    orderService.__setMockOrders(mockOrders);
    response = mockResponse();
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  test("create new order - valid request body", async () => {
    const validPersonData = {
        customerId: 2,
        deliveryAddress: {
          firstName: "Zsolti",
          lastName: "Abeka",
          phone: "01234566778",
          street: "Petofi Sandor",
          number: "12",
          ZIP: "112",
          city: "Ozd",
        },
        products: [{
            _id: "60f7e2ac78c55b330d99ad9b",
            name: "Milk",
            price: 2.7,
            quantity: 1,
          }],
        total: 2.7,
        shipping: 10
      };

    const request = mockRequest({
      body: validPersonData,
      customerId: 2
    });

    await orderController.create(request, response, nextFunction);
        
    expect(orderService.create).toBeCalled();
    expect(response.status).toBeCalledWith(201);
    expect(response.json).toBeCalled();
    expect(nextFunction).not.toBeCalled();
       
  });

  test('Create new order - INVALID request body', async () => {
      const request = mockRequest({
        body: {
            deliveryAddress: {
              firstName: "Zsolti",
              lastName: "Abeka",
              phone: "01234566778",
              street: "Petofi Sandor",
              number: "12",
              ZIP: "112",
              city: "Ozd",
            },
            products: [{
                _id: "60f7e2ac78c55b330d99ad9b",
                name: "Milk",
                price: 2.7,
                quantity: 1,
              }],
            total: 2.7,
            shipping: 10
          }
      });

      await orderController.create(request, response, nextFunction);
       
      expect(response.json).not.toBeCalled();
      expect(nextFunction).toBeCalledWith(new createError.BadRequest(`Request body is missing required fields`));
     
  })

  test('Get orders of a customer and sort it descending - valid data', async () => {
      const CUSTOMER_ID = 1;

      const request = {
        query: {
            customerId: CUSTOMER_ID,
            _sort: 'date',
            _order: 'desc'
        },
        customerId: CUSTOMER_ID
      };

      const sortCriterium = {}
      sortCriterium[request.query._sort] = request.query._order;
    
      await orderController.get(request, response, nextFunction);

      expect(orderService.get).toBeCalledWith({ customerId: CUSTOMER_ID, sortCriterium });
      expect(response.status).toBeCalledWith(200);
      expect(response.json).toBeCalledWith([ mockOrders[0], mockOrders[1] ]);
    
  })

  test('Get orders of a customer and sort it descending - INVALID customer ID', async () => {
      const CUSTOMER_ID = 'locitrom';

      const request = {
        query: {
            customerId: CUSTOMER_ID,
            _sort: 'date',
            _order: 'desc'
        }
      };

      const sortCriterium = {}
      sortCriterium[request.query._sort] = request.query._order;
    
      await orderController.get(request, response, nextFunction);
      expect(nextFunction).toBeCalledWith(new createError.BadRequest('invalid customerId'))
      expect(orderService.get).not.toBeCalled();
      expect(response.status).not.toBeCalled();
      expect(response.json).not.toBeCalled();
    
  })
});
