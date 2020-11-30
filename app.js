const express = require('express');
const app = express();
const Joi = require('@hapi/joi');
const movies = require('./movies');

const db_neo = require("./neo");

/*
var driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', '12345')
  )
*/

app.use(express.json());

app.use('/abc', movies);


app.get('/', (req, res) => {

    db_neo.do_query("GET_ALL", {
        name: "Billie",
        role: "Musician"
    }, (data) => {
        data.forEach((element, index) => {
            console.log(element);
            //console.log(element.labels);
            //console.log(element.properties);
        });
    });
    
    res.send('Holi');
})

const port = process.env.PORT || '5000';
app.listen(port, () => console.log(`Server started on Port ${port}`));