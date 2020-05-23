const fs = require('fs');
fs.readFile('query.txt', 'utf8', function(err, data) {
    if (err) {
        return console.log(err); 
    } else {
        let queryArray = data.split('\n');
        console.log(queryArray);
    }
});
