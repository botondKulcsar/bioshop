const authenticationByJWT = require('./authenticate');
const { mockRequest, mockResponse } = require('jest-mock-req-res');


describe('authenticate method tests', () => {
    
    let response, nextFunction;

    beforeEach(() => {
        response = mockResponse();
        nextFunction = jest.fn()
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('authenticate - missing authorization from request headers', async() => {
        const request = mockRequest();

        await authenticationByJWT(request, response, nextFunction);
        expect(response.sendStatus).toBeCalledWith(401);
        expect(nextFunction).not.toBeCalled();
    }),

    test('authenticate - invalid authorization token in request headers', async() => {
        const request = mockRequest({
            headers: {
                authorization: 'Bearer invalid'
            }
        });

        await authenticationByJWT(request, response, nextFunction);
        expect(response.sendStatus).toBeCalledWith(500);
        expect(nextFunction).not.toBeCalled();
    })
})