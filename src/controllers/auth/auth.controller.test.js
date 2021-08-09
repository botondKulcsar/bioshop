const authController = require('./auth.controller');
const createError = require('http-errors');
const { mockRequest, mockResponse } = require('jest-mock-req-res');


const authService = require('./auth.service');
jest.mock('./auth.service');

describe('AuthController tests', () => {
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
            password: "$2a$10$mwemqL3j6F8sG2gp.ErQKOUsfQvLScQQaBbUeymx5dlyhFr7uPiQW",
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
        authService.__setMockCustomers(mockCustomers);
        response = mockResponse();
        nextFunction = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('register - valid customer data', async () => {
        const customerData = {
            firstName: 'Elek',
            lastName: 'Teszt',
            email: 'nincs@email.cimem',
            password: 'assincs',
            address: { street: 'Ady Endre', number: '12', city: 'Csajága Röcsöge', state: 'Bakker', ZIP: '1212' },
            phone: '00032342141243',
        }

        const expected = { email: customerData.email };

        const request = mockRequest({
            body: customerData
        })

        await authController.register(request, response, nextFunction);
        expect(authService.emailIsUnique).toBeCalledWith(customerData.email);
        expect(nextFunction).not.toBeCalled();
        expect(response.status).toBeCalledWith(201);
        expect(response.json).toBeCalledWith(expected);
    });

    test('register - INvalid customer data', async () => {
        const customerData = {
            lastName: 'Teszt',
            email: 'nincs@email.cim',
            password: 'assincs',
            address: { street: 'Ady Endre', number: '12', city: 'Csajága Röcsöge', state: 'Bakker', ZIP: '1212' },
            phone: '00032342141243',
        }



        const request = mockRequest({
            body: customerData
        })

        await authController.register(request, response, nextFunction);
        expect(nextFunction).toBeCalledWith(new createError.BadRequest(`Request body is missing required fields`));
        expect(authService.emailIsUnique).not.toBeCalled();
        expect(response.status).not.toBeCalled();
        expect(response.json).not.toBeCalled();
    })

    test('Login - valid credentials', async () => {
        const email = 'beka@beka.com';
        const password = '1234';
        const request = mockRequest({
            body: { email, password }
        });

        await authController.login(request, response, nextFunction);
        expect(nextFunction).not.toBeCalled();
        expect(authService.login).toBeCalledWith(email);
        expect(response.status).toBeCalledWith(200);
        expect(response.json).toBeCalled();
    })

    test('Login - INvalid credentials', async () => {
        const email = 'beka@beka.com';
        const password = 'IdonnoMan';
        const request = mockRequest({
            body: { email, password }
        })

        await authController.login(request, response, nextFunction);
        expect(nextFunction).toBeCalledWith(new createError.Unauthorized("Submitted email-password combination is invalid"));
        expect(authService.login).toBeCalledWith(email)
    })

    test('Refresh - missing token',  async() => {
        const request = mockRequest();

        await authController.refresh(request, response, nextFunction);
        expect(response.sendStatus).toBeCalledWith(401);
        expect(response.json).not.toBeCalled();
        expect(nextFunction).not.toBeCalled();
    })

    test('Refresh - invalid token',  async() => {
        const request = mockRequest({
            body: { refreshToken: 'fasdfdasfasdf' }
        });

        await authController.refresh(request, response, nextFunction);
        expect(response.sendStatus).toBeCalledWith(403);
        expect(response.json).not.toBeCalled();
        expect(nextFunction).not.toBeCalled();
    });

    test('Logout - missing token', async() => {
        const request = mockRequest();

        await authController.logout(request, response, nextFunction);
        expect(response.sendStatus).toBeCalledWith(403);
        expect(response.json).not.toBeCalled();
        expect(nextFunction).not.toBeCalled();
        
    })

    test('Logout - invalid token', async() => {
        const request = mockRequest({
            body: { refreshToken: 'fasdfdasfasdf' }
        });

        await authController.logout(request, response, nextFunction);
        expect(response.sendStatus).not.toBeCalled();
        expect(response.json).not.toBeCalled();
        expect(nextFunction).toBeCalledWith(new createError.Unauthorized("already logged out"));
        
    })


})