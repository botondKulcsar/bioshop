const orderService = jest.mock('./order.service');

let mockOrders;

orderService.__setMockOrders = (data) => mockOrders = data;

orderService.create = jest.fn((newOrder) => {
    const id = Math.max( ...mockOrders.map(o => o.id)) + 1;
    const date = new Date().toUTCString();
    const order = { ...newOrder, id, date };
    mockOrders = [ ...mockOrders, order ];
    return Promise.resolve(order);
})

orderService.get = jest.fn(({ customerId, _sort, _order }) => Promise.resolve(
    mockOrders.filter(o => o.customerId === customerId)
            .sort((a, b) =>  _order === 'desc' ? Date.parse(b[_sort]) - Date.parse(a[_sort]) : Date.parse(a[_sort]) - Date.parse(b[_sort]))
))

module.exports = orderService;