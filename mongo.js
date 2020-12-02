const MongoClient = require("mongodb").MongoClient;

const db_ESports = "mongodb+srv://admin:test@esports.sb0eo.mongodb.net/<dbname>?retryWrites=true&w=majority";
const dbName = "DB_ESports";


function do_query(query, info, dataCallback){

    MongoClient.connect(db_ESports, function lambda(err, dbInstance) {

        if (err) {
            console.log(`[MongoDB connection] ERROR: ${err}`);
            dataCallback(err);

        } else {
            const dbObject = dbInstance.db(dbName);
            const client_collection = "client";
            const product_collection = "product";

            switch(query) {

                case "FIND":
                    dbCollection = dbObject.collection(info.collection); 
                    dbCollection.find({}, { projection: {_id:0}} ).toArray(function(error, result) {
                        if(error){console.log(error);}
                        dataCallback(result);
                    });
                    break;

                case "FIND_CLIENT":
                    dbCollection = dbObject.collection(client_collection); 
                    dbCollection.find({username: info.username}, { projection: {_id:0}} ).toArray(function(error, result) {
                        if(error){console.log(error);}
                        dataCallback(result);
                    });
                    break;

                case "LOGIN":
                    dbCollection = dbObject.collection(client_collection); 
                    dbCollection.find({username: info.username, password: info.password}, { projection: {_id:0}} ).toArray(function(error, result) {
                        if(error){console.log(error);}
                        dataCallback(result);
                    });
                    break;

                case "REGISTER_CLIENT":
                    dbCollection = dbObject.collection(client_collection); 
                    dbCollection.insertOne(info, (error, result) => {
                        if(error){dataCallback(error);}
                        else{dataCallback(200);}
                    });
                    break;

                case "FIND_PRODUCT":
                    dbCollection = dbObject.collection(product_collection); 
                    dbCollection.find({name: info.name}, { projection: {_id:0}} ).toArray(function(error, result) {
                        if(error){console.log(error);}
                        dataCallback(result);
                    });
                    break;

                case "NEW_PRODUCT":
                    dbCollection = dbObject.collection(product_collection); 
                    dbCollection.insertOne(info, (error, result) => {
                        if(error){dataCallback(error);}
                        else{dataCallback(200);}
                    });
                    break;

                case "ADD_OFFER":
                    dbCollection = dbObject.collection(product_collection); 
                    dbCollection.updateOne({ name: info.name }, { $set: {offer: info.offer} }, (error, result) => {
                        if(error){dataCallback(error);}
                        else{dataCallback(200);}
                    });
                    break;

                default:
                    dataCallback("Consulta no encontrada");
              }
        
            dbInstance.close();
        }
    });
}


module.exports = {
    do_query
};