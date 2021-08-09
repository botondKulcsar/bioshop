const orderData = [
    {
        "customerId": "60f7de8085ea140d3c9702df",
        "deliveryAddress": {
            "firstName": "Botond",
            "lastName": "Kulcsár",
            "phone": "+36000000003",
            "street": "Olajos",
            "number": "1",
            "ZIP": "6723",
            "city": "Szeged"
        },
        "products": [
            {
                "_id": "60f7e2ac78c55b330d99ad96",
                "name": "Spinach",
                "price": 2.5,
                "quantity": 1
            },
            {
                "_id": "60f7e2ac78c55b330d99ad98",
                "name": "Tomato",
                "price": 4,
                "quantity": 1
            }
        ],
        "total": 6.5,
        "shipping": 10
    },
    {
        "customerId": "60f7de8085ea140d3c9702df",
        "deliveryAddress": {
            "firstName": "Botond",
            "lastName": "Kulcsár",
            "phone": "+36000000001",
            "street": "Olajos",
            "number": "1",
            "ZIP": "6723",
            "city": "Szeged"
        },
        "products": [
            {
                "_id": "60f7e2ac78c55b330d99ad96",
                "name": "Spinach",
                "price": 2.5,
                "quantity": 1
            },
            {
                "_id": "60f7e2ac78c55b330d99ad97",
                "name": "Bread",
                "price": 3.1,
                "quantity": 1
            }
        ],
        "total": 5.6,
        "shipping": 10,
    },
    {
        "customerId": "60fc8fe3c91dbe5c535be6df",
        "deliveryAddress": {
            "firstName": "Zsolti",
            "lastName": "Abeka",
            "phone": "01234566778",
            "street": "Petofi Sandor",
            "number": "12",
            "ZIP": "112",
            "city": "Ozd"
        },
        "products": [
            {
                "_id": "60f7e2ac78c55b330d99ad98",
                "name": "Tomato",
                "price": 4,
                "quantity": 2
            }
        ],
        "total": 8,
        "shipping": 10,
    }
];

module.exports = orderData;