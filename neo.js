const neo4j = require('neo4j-driver');
var driver = neo4j.driver('bolt://100.26.161.61:33173', neo4j.auth.basic('neo4j', 'class-solution-winters'));

//MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r

function do_query(query, info, dataCallback){

    const session = driver.session();
    var query_raw, query_info;

    switch(query) {
        case "GET_ALL":
            query_raw = "MATCH (n) RETURN n";
            break;

        case "CREATE":
            query_raw = "CREATE (n:Person { name: $name_param, title: $role_param })";
            query_info = {
                name_param: info.name,
                role_param: info.role
            };
            break;

        case "TEST":
            query_raw = "match(p:Person {name: 'Kevin Pollak'})-[c:ACTED_IN]-(m:Movie) return m";
            break;

        case "AMOUNT_PURCHASE":
            query_raw = "MATCH (n:purchase) RETURN count(n) as count";
            break;

        case "ADD_PURCHASE":
            query_raw = "CREATE (n:purchase { date: $date_param, cost: $cost_param })";
            query_info = {
                date_param: info.date,
                cost_param: info.cost
            };
            break;

        case "NEW_PRODUCT":
            query_raw = "CREATE (prdct:product { name: $name_param })";
            query_info = {
                name_param: info.name,
            };
            break;

        case "REGISTER_CLIENT":
            query_raw = "CREATE (c:client { name: $name_param })";
            query_info = {
                name_param: info.username,
            };
            break;

        default:
            session.close();
            dataCallback("Consulta no encontrada");
      }

      session.run(query_raw, query_info)
      .subscribe({
          onNext: record => {
            dataCallback(record._fields);
          },
          onCompleted: () => {
              session.close();
          },
          onError: error => {
              dataCallback(error);
          }
      });

}

module.exports = {
    do_query
};