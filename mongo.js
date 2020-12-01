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

            switch(query) {

                case "FIND":
                    dbCollection = dbObject.collection(info.collection); 
                    dbCollection.find({}, { projection: {_id:0}} ).toArray(function(error, result) {
                        if(error){console.log(error);}
                        dataCallback(result);
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