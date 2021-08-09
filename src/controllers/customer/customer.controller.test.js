const customerController = require("./customer.controller");
const createError = require("http-errors");
const { mockRequest, mockResponse } = require("jest-mock-req-res");

const customerService = require("./customer.service");
jest.mock("./customer.service");

describe("CustomerController tests", () => {
    const mockCustomers = [
        {
            id: 1,
            firstName: "Botond",
            lastName: "Kulcsár",
            email: "bkulcsar@gmx.com",
            password: "1gumibaba2",
            address: {
                street: "Olajos",
                number: "1",
                city: "Szeged",
                state: "Csongrád-Csanád",
                ZIP: "6723",
            },
            phone: "+36000000001"
        },
        {
            id: 2,
            firstName: "Zsolti",
            lastName: "Abeka",
            email: "beka@beka.com",
            password: "1234",
            address: {
                street: "Petofi Sandor",
                number: "12",
                city: "Ozd",
                state: "Kerekerdo",
                ZIP: "112",
            },
            phone: "01234566778"
        }
    ];

    let response;
    let nextFunction;

    beforeEach(() => {
        customerService.__setMockCustomers(mockCustomers);
        response = mockResponse();
        nextFunction = jest.fn();
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('findOne - valid ID', async () => {
        const CUSTOMER_ID = 1;
        const request = mockRequest({
            params: { id: CUSTOMER_ID },
            customerId: CUSTOMER_ID
        });

        const expected = JSON.parse(JSON.stringify(mockCustomers[0]));
        delete expected.password;

        await customerController.findOne(request, response, nextFunction)
        expect(customerService.findById).toBeCalledWith(CUSTOMER_ID);
        expect(response.status).toBeCalledWith(200);
        expect(response.json).toBeCalledWith(expected);
        expect(nextFunction).not.toBeCalled();
    });

    test('findOne - INvalid ID', async () => {
        const CUSTOMER_ID = 'joska';
        const request = mockRequest({
            params: { id: CUSTOMER_ID }
        });

        await customerController.findOne(request, response, nextFunction)
        expect(customerService.findById).not.toBeCalled();
        expect(response.status).not.toBeCalled();
        expect(response.json).not.toBeCalled();
        expect(nextFunction).toBeCalledWith(new createError.BadRequest(`invalid id`));
    });

 

    test('Update - valid customer ID', async () => {
        const CUSTOMER_ID = 1;
        const request = mockRequest({
            params: { id: CUSTOMER_ID },
            body: {
                firstName: 'kecs'
            },
            customerId: CUSTOMER_ID
        });

        await customerController.update(request, response, nextFunction)
        expect(customerService.update).toBeCalledWith(CUSTOMER_ID, request.body);
        expect(nextFunction).not.toBeCalled();
        expect(response.status).toBeCalledWith(200);
        expect(response.json).toBeCalledWith(mockCustomers[0]);

    })

    test('Update - INvalid customer ID', async () => {
        const CUSTOMER_ID = 'joska';
        const request = mockRequest({
            params: { id: CUSTOMER_ID },
            body: {
                firstName: 'kecs'
            }
        });

        await customerController.update(request, response, nextFunction)
        expect(customerService.update).not.toBeCalled();
        expect(nextFunction).toBeCalledWith(new createError.BadRequest(`invalid id`));
        expect(response.status).not.toBeCalled();
        expect(response.json).not.toBeCalled();

    })

});
