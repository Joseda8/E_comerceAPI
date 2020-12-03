function join_json(in_1, in_2){
    const result = {};
    let key;
    
    for (key in in_1) {
      if(in_1.hasOwnProperty(key)){
        result[key] = in_1[key];
      }
    }
    
    for (key in in_2) {
      if(in_2.hasOwnProperty(key)){
        result[key] = in_2[key];
      }
    }

    return result;
}

module.exports = {
    join_json
};



