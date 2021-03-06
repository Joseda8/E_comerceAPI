const express = require('express');
const cors = require('cors');
const app = express();
const Joi = require('@hapi/joi');
const movies = require('./movies');

const db_neo = require("./neo");
const db_mongo = require("./mongo");
const util = require("./util");

/*
var driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', '12345')
  )
*/

//app.use(express.json());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(cors());

app.get('/get_collection', (req, res) => {

    const {collection} = req.query;

    const info = {
        collection: collection
    };

    db_mongo.do_query("FIND", info, (data) => {
        if(data.length==0){
            res.sendStatus(404);
        }else{
            res.json(data);
        }
    });
})

/*
ADMINISTRADORES
*/

app.post("/client_history", (req, res) => {
    const client_to_find = req.body;

    db_neo.do_query("SHOPPING_HISTORY", client_to_find, (data) => {
        var response = {};
        if(data.length == 0){
            res.sendStatus(404);
        }else{
            data.forEach((prdct) => {
                const purch_id = prdct[0].properties.id;
                if(response[purch_id]==undefined){
                    response[purch_id] = {
                        date: prdct[0].properties.date, 
                        cost: prdct[0].properties.cost,
                        products: []
                    }
                }
                response[purch_id].products.push({name: prdct[1].properties.name, amount: prdct[2].properties.amount});
            });
            res.json(response);
        }
    });;
});

app.get("/count_sales", (req, res) => {
    db_neo.do_query("COUNT_SALES", null, (data) => {
        var response = [];
        
        if(data.length == 0){
            res.sendStatus(404);
        }else{
            data.forEach((prdct) => {
                response.push({
                    name: prdct[0].properties.name, 
                    username: prdct[0].properties.username, 
                    products: prdct[1],
                });
            });
            res.json(response);
        }
        
    });;
});

app.get('/common_purchase', (req, res) => {

    const {username} = req.query;

    const info = {
        username: username
    };

    db_neo.do_query("COMMON_PURCHASE", info, (data) => {
        var response = {};
        var response_list = []
        
        if(data.length == 0){
            res.sendStatus(404);
        }else{
            data.forEach((client) => {
                const username = client[0].properties.username;
                if(response[username]==undefined){
                    response[username] = {
                        username: client[0].properties.username, 
                        name: client[0].properties.name, 
                        products: []
                    }
                }

                if(!response[username].products.includes(client[1].properties.name)){
                    response[username].products.push(client[1].properties.name);
                }
            });
            for (var i in response) {
                response_list.push(response[i]);
            }

            res.json(response_list);
        }
    
    });;
})

app.get('/find_product', (req, res) => {

    const {product_name} = req.query;

    const info = {
        name: product_name
    };

    db_mongo.do_query("FIND_PRODUCT", info, (data) => {
        if(data.length==0){
            res.sendStatus(404);
        }else{
            res.json(data);
        }
    });
})

app.post("/insert_product", (req, res) => {
    const new_product = req.body;

    db_mongo.do_query("NEW_PRODUCT", new_product, (data) => {
        if(data==200){
            db_neo.do_query("NEW_PRODUCT", {name: new_product.name}, (data) => {});
            res.sendStatus(200);
        }else{
            res.sendStatus(400);
        }
    });
});

app.put("/add_offer", (req, res) => {
    const {product_name} = req.query;
    const offer_info = req.body;

    const info = {
        name: product_name,
        offer: offer_info
    };

    db_mongo.do_query("ADD_OFFER", info, (data) => {
        if(data==200){
            res.sendStatus(200);
        }else{
            res.sendStatus(400);
        }
    });

});


/*
CLIENTES
*/
app.post('/login', (req, res) => {

    const client_to_login = req.body;

    const info = {
        username: client_to_login.username,
        password: client_to_login.password
    };

    db_mongo.do_query("LOGIN", info, (data) => {
        if(data.length==0){
            res.sendStatus(401);
        }else{
            res.json(data);
        }
    });
})

app.post("/register_client", (req, res) => {
    const new_client = req.body;

    db_mongo.do_query("FIND_CLIENT", {username: new_client.username}, (data) => {
        if(data.length==0){
            db_neo.do_query("REGISTER_CLIENT", {name: new_client.name, username: new_client.username}, (data) => {});
            db_mongo.do_query("REGISTER_CLIENT", new_client, (data) => {
                res.sendStatus(200);
            });
        }else{
            res.sendStatus(409);
        }
    });
});

app.post('/add_purchase', (req, res) => {

    const purchase_info = req.body;
    var products = [];
    var ERROR = false;

    purchase_info.products.forEach((prdct) => {
        products.push(prdct.name);
    });

    db_mongo.do_query("FIND_PRODUCTS", products, (products_info) => {
        purchase_info.products.forEach((purchc) => {
            products_info.forEach((prdct) => {
                if(prdct.name == purchc.name){
                    if(prdct.units - purchc.amount < 0){
                        ERROR = true;
                    }
                }
            });
        });

        if(ERROR){
            res.sendStatus(409);
        }else{
            var cost = 0;
            purchase_info.products.forEach((purchc) => {
                products_info.forEach((prdct) => {
                    if(prdct.name == purchc.name){
                        let this_cost = prdct.price * purchc.amount;
                        let discount = 0;
                        if(prdct.offer !== undefined){

                            prdct.offer.forEach((offer) => {
                                if(offer.info.type == "Descuento"){
                                    discount += offer.info.condition;
                                }
                            });
                            
                        }
                        cost += this_cost - this_cost*discount;
                        db_mongo.do_query("UPDATE_INVENTORY", {name: prdct.name, units: prdct.units - purchc.amount}, (data) => {});
                    }
                });
            });
            db_neo.do_query("AMOUNT_PURCHASE", null, (amount_purchase) => {
                db_neo.do_query("ADD_PURCHASE", {id: amount_purchase[0][0].low, date: purchase_info.date, cost: cost}, (data) => {
                    db_neo.do_query("RELATE_PURCHASE_CLIENT", {id: amount_purchase[0][0].low, username: purchase_info.client}, (data) => {
                        purchase_info.products.forEach((purchc) => {
                            db_neo.do_query("PRODUCT_BUYED", {id: amount_purchase[0][0].low, prod_name: purchc.name, amount: purchc.amount}, (data) => {});
                            db_neo.do_query("PRODUCT_SELL", {id: amount_purchase[0][0].low, prod_name: purchc.name, amount: purchc.amount}, (data) => {});
                        });
                    });
                });
            });
            res.sendStatus(200);
        }
    });

})


const port = process.env.PORT || '5000';
app.listen(port, () => console.log(`Server started on Port ${port}`));