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

app.get('/mongo', (req, res) => {

    const info = {
        collection: "brand"
    };

    db_mongo.do_query("FIND", info, (data) => {
        console.log(data);
    });
    
    res.send('Mongo');
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


const port = process.env.PORT || '5000';
app.listen(port, () => console.log(`Server started on Port ${port}`));