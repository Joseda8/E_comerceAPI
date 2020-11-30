const neo4j = require('neo4j-driver');
var driver = neo4j.driver('bolt://54.237.207.193:33144', neo4j.auth.basic('neo4j', 'designation-cable-creeks'));

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
        default:
            session.close();
            dataCallback("La consulta no es correcta");
      }

      session.run(query_raw, query_info)
      .subscribe({
          onNext: record => {
              dataCallback(record._fields);
          },
          onCompleted: () => {
              session.close()
          },
          onError: error => {
              dataCallback(error);
          }
      });

}

module.exports = {
    do_query
};