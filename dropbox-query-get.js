const fs = require('fs');
const queryArray = fs.readFileSync('query.txt').toString().split('\n');
console.log(queryArray);