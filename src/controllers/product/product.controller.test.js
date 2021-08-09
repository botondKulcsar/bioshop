const productController = require('./product.controller');
const createError = require('http-errors');
const { mockRequest, mockResponse } = require('jest-mock-req-res');

const productService = require('./product.service');
jest.mock('./product.service');

describe('ProductController tests', () => {
    
    const mockProducts = [
        {
            "id": 1,
            "name": "Spinach",
            "category": "vegetables",
            "price": 2.5,
            "quantity": 50,
            "description": "Fresh spinach from our garden",
            "longDescription": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            "imageUrl": "https://images.unsplash.com/photo-1592419391068-9bd09dd58510?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
          },
          {
            "id": 2,
            "name": "Bread",
            "category": "other",
            "price": 3.1,
            "quantity": 50,
            "description": "Fresh bread made from organic ingredients",
            "longDescription": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            "imageUrl": "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
          },
          {
            "id": 3,
            "name": "Tomato",
            "category": "vegetables",
            "price": 4,
            "quantity": 50,
            "description": "Organic tomatoes from our garden",
            "longDescription": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            "imageUrl": "https://images.unsplash.com/photo-1606588260160-0c4707ab7db5?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1016&q=80"
          }
    ];

    let nextFunction;
    let response;

    beforeEach(() => {
        productService.__setMockProducts(mockProducts);
        nextFunction = jest.fn();
        response = mockResponse();
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('getOne - valid ID', async () => {
        const PRODUCT_ID = 1;
        const request = mockRequest({
            params: { id: PRODUCT_ID }
        })

        await productController.getOne(request, response, nextFunction)
           
        expect(productService.findOne).toBeCalledWith(PRODUCT_ID);
        expect(response.status).toBeCalledWith(200);
        expect(response.json).toBeCalledWith(mockProducts[0]);
        expect(nextFunction).not.toBeCalled();
            
    });

    test('getOne - INVALID ID', async () => {
        const PRODUCT_ID = 'invalid';
        const request = mockRequest({
            params: { id: PRODUCT_ID }
        });

        await productController.getOne(request, response, nextFunction)
    
        expect(productService.findOne).not.toBeCalled();
        expect(response.json).not.toBeCalled();
        expect(nextFunction).toBeCalledWith(new createError.BadRequest(`invalid id`));
    
    });

    test('getAll - empty QUERY', async () => {
        const request = mockRequest();

        await productController.getAll(request, response, nextFunction)
          
        expect(productService.findAll).toBeCalledWith(request.query)
        expect(response.status).toBeCalledWith(200);
        expect(response.json).toBeCalledWith(mockProducts);
        expect(nextFunction).not.toBeCalled();
        
    })

    test('getAll - valid QUERY', async () => {
        const category = 'other'
        const request = mockRequest({
            query: { category }
        });

        const expected = [ mockProducts[1] ];

        await productController.getAll(request, response, nextFunction)
           
        expect(productService.findAll).toBeCalledWith(request.query);
        expect(response.status).toBeCalledWith(200);
        expect(response.json).toBeCalledWith(expected);
        expect(nextFunction).not.toBeCalled();
            
    })

    
})