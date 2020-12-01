const express = require('express');
const app = express();
const Joi = require('@hapi/joi');
const movies = require('./movies');

const db_neo = require("./neo");
const db_mongo = require("./mongo");

/*
var driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', '12345')
  )
*/

app.use(express.json());
//app.use(express.json({limit: '50mb'}));
//app.use(express.urlencoded({limit: '50mb'}));

app.use('/abc', movies);


app.get('/neo', (req, res) => {

    const info = {
        name: "Billie",
        role: "Musician"
    };

    db_neo.do_query("GET_ALL", info, (data) => {
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


app.post("/insert_product", (req, res) => {
    const new_product = req.body;

    console.log(new_product);

    /*
    db.do_query_to_cluster(continent, "REGISTER", new_user, (data) => {
        console.log(data);
    });
    */

    res.sendStatus(200);
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
            db_mongo.do_query("REGISTER_CLIENT", new_client, (data) => {
                res.sendStatus(200);
            });
        }else{
            res.sendStatus(409);
        }
    });
});


const port = process.env.PORT || '5000';
app.listen(port, () => console.log(`Server started on Port ${port}`));