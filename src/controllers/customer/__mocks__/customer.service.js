const customerService = jest.mock('./customer.service');

let mockCustomers;

customerService.__setMockCustomers = (data) => mockCustomers = data;

customerService.findById = jest.fn(
    (id) => Promise.resolve(mockCustomers.find(p => p.id === id)));


customerService.update = jest.fn(
    (id, payload) => {
        const index = mockCustomers.findIndex(c => c.id === id);
        if (index === -1) { return Promise.resolve(undefined); }
        const foundCustomer = mockCustomers.find(c => c.id === id);
        mockCustomers[index] = { ...foundCustomer, ...payload };
        return Promise.resolve(mockCustomers[index]);
    }
)


module.exports = customerService;