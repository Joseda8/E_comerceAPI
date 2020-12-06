const neo4j = require('neo4j-driver');
var driver = neo4j.driver('bolt://100.25.167.154:33138', neo4j.auth.basic('neo4j', 'lengths-buzzer-print'));

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
            query_raw = "CREATE (n:purchase { id: $id_param, date: $date_param, cost: $cost_param })";
            query_info = {
                id_param: info.id,
                date_param: info.date,
                cost_param: info.cost
            };
            break;

        case "RELATE_PURCHASE_CLIENT":
            query_raw = "MATCH(p:purchase{id: $id_param}),(c:client{username: $username_param})CREATE(c) -[r:buy]->(p)";
            query_info = {
                id_param: info.id,
                username_param: info.username
            };
            break;

        case "PRODUCT_BUYED":
            query_raw = "MATCH(prd:product {name: $prd_param}), (purch: purchase {id: $purch_param}) CREATE (prd)-[r:buyed {amount: $amount_param}]->(purch)";
            query_info = {
                purch_param: info.id,
                prd_param: info.prod_name,
                amount_param: info.amount
            };
            break;

        case "PRODUCT_SELL":
            query_raw = "MATCH(prd:product {name: $prd_param}), (purch: purchase {id: $purch_param}) CREATE (purch)-[r:sell {amount: $amount_param}]->(prd)";
            query_info = {
                purch_param: info.id,
                prd_param: info.prod_name,
                amount_param: info.amount
            };
            break;

        case "NEW_PRODUCT":
            query_raw = "CREATE (prdct:product { name: $name_param })";
            query_info = {
                name_param: info.name,
            };
            break;

        case "REGISTER_CLIENT":
            query_raw = "CREATE (c:client { name: $name_param, username: $username_param })";
            query_info = {
                name_param: info.name,
                username_param: info.username
            };
            break;

        case "SHOPPING_HISTORY":
            query_name = "MATCH(clt:client {name: $name_param})-[r:buy]-(purch:purchase) match(purch)-[b:sell]-(prdt:product) return purch, prdt, b";
            query_usr_name = "MATCH(clt:client {username: $name_param})-[r:buy]-(purch:purchase) match(purch)-[b:sell]-(prdt:product) return purch, prdt, b";
            query_info = {
                name_param: info.name,
            };
            if(info.query=="NAME"){
                query_raw = query_name;
            }else if(info.query=="USERNAME"){
                query_raw = query_usr_name;
            }
            break;        

        case "COUNT_SALES":
            query_raw = "match(prdt: product) -[r:buyed]-(purch: purchase) return prdt, sum(r.amount) as amount";
            break;

        case "COMMON_PURCHASE":
            query_raw = "MATCH(clt:client {username: $username_param})-[r:buy]-(purch:purchase) MATCH(purch)-[b:sell]-(prdt:product) MATCH(prdt)-[c:buyed]-(purch_2: purchase) MATCH(clt_1: client)-[d:buy]-(purch_2) WHERE NOT(clt_1.username = $username_param) return clt_1, prdt";
            query_info = {
                username_param: info.username
            };
            break;

        default:
            session.close();
            dataCallback("Consulta no encontrada");
      }

      var response = []
      session.run(query_raw, query_info)
      .subscribe({
          onNext: record => {
              response.push(record._fields);
          },
          onCompleted: () => {
              dataCallback(response);
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