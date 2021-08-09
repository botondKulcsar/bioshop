const productService = jest.mock('./product.service');

let mockProducts;

productService.__setMockProducts = (data) => mockProducts = data;

productService.findAll = jest.fn(({ category } = {}) => Promise.resolve(mockProducts.filter(
    p => category ? p.category === category : p)));

productService.findOne = jest.fn((id) => Promise.resolve(mockProducts.find(p => p.id === id)));

module.exports = productService;

