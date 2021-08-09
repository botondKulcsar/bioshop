const authService = jest.mock("./auth.service");

let mockCustomers;

let mockTokens = [];

authService.__setMockCustomers = (data) => (mockCustomers = data);

authService.create = jest.fn((customerData) => {
  const id = Math.max(...mockCustomers.map((p) => p.id)) + 1;
  const newCustomer = { ...customerData, id };
  mockCustomers = [...mockCustomers, newCustomer];
  delete newCustomer.password;
  return Promise.resolve(newCustomer);
});

authService.emailIsUnique = jest.fn((email) => {
  const foundCustomers = mockCustomers.filter((c) => c.email === email);
  return Promise.resolve(foundCustomers.length === 0);
});

authService.login = jest.fn((email) => {
  const user = mockCustomers.find((c) => c.email === email);
  return Promise.resolve(user);
});

authService.saveToken = jest.fn((token) => {
    const _id = Math.max(...mockTokens.map((t) => t._id)) + 1;
    savedToken = { refreshToken: token, _id };
    mockTokens = [ ...mockTokens, savedToken ];
    return Promise.resolve(savedToken);
})

authService.findToken = jest.fn((token) => Promise.resolve(mockTokens.find(t => t.refreshToken === token)))

module.exports = authService;
