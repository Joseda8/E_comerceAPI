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

app.use('/abc', movies);


app.get('/neo', (req, res) => {

    const info = {
        name: "Billie",
        role: "Musician"
    };

    db_neo.do_query("CREATE", info, (data) => {
        data.forEach((element, index) => {
            console.log(element);
            //console.log(element.labels);
            //console.log(element.properties);
        });
    });
    
    res.send('Neo');
})

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
            db_neo.do_query("NEW_PRODUCT", {name: new_product.name}, data);
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
            db_neo.do_query("REGISTER_CLIENT", {username: new_client.username}, data);
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
        console.log("Productos ", products_info);
        console.log("Compra ", purchase_info);

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
                                    discount = offer.info.condition;
                                }
                            });
                            
                        }
                        cost += this_cost - this_cost*discount;
                        //db_mongo.do_query("UPDATE_INVENTORY", {name: prdct.name, units: prdct.units - purchc.amount}, (data) => {});
                    }
                });
            });
            console.log(cost);
            db_neo.do_query("AMOUNT_PURCHASE", null, (amount_purchase) => {
                console.log(amount_purchase[0].low);
            });
            res.sendStatus(200);
        }
    });

})


const port = process.env.PORT || '5000';
app.listen(port, () => console.log(`Server started on Port ${port}`));