const express = require('express');
const app = express();
const Joi = require('@hapi/joi');
const movies = require('./movies');

var neo4j = require('neo4j-driver')
var driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', '12345')
  )

app.use(express.json());

app.use('/abc', movies);


app.get('/', (req,res) => {
    const session = driver.session();
    session
    .run('MATCH (n) RETURN n')
    .subscribe({
    onNext: record => {
        record._fields.forEach((element, index) => {
        console.log(element.labels);
        console.log(element.properties);
    });
    },
    onCompleted: () => {
        session.close()
    },
    onError: error => {
        console.log(error)
    }
    });

    res.send('Holi');
})

app.get('/create', (req,res) => {
    const session = driver.session();
    session
    .run('CREATE (n:Person { name: $name_param, title: $role_param })', {
        name_param: "Cerati",
        role_param: "Musician"
    }).subscribe({
        onCompleted: () => {
            session.close()
        },
        onError: error => {
            console.log(error)
        }
    });

    res.send('Create');
})

const port = process.env.PORT || '5000';
app.listen(port, () => console.log(`Server started on Port ${port}`));