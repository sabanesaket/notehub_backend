// has code to connect with database

/*
The require function is a key feature in Node.js and is used to import functionality from other modules. It allows you to access and use code defined in other JavaScript files or modules within your current module.
The require function takes a module identifier (either a relative or absolute path) as its argument and returns the exports object of that module. The exports object contains the public interface of the module, which includes functions, objects, or variables that have been explicitly exported using module.exports or exports.
*/

const mongoose = require('mongoose');

function connectToMongo(){
    mongoose.connect('mongodb://127.0.0.1:27017/notehub').then(()=>{console.log("Connected To DB")});
}

// /*
// module.exports is a special object that is used to define the public interface of a module and make its functionality available for other modules to use
// In Node.js and some other JavaScript environments, each file is treated as a separate module. The module.exports object is part of the CommonJS module system and is used to export values, functions, or objects from a module.
// By assigning values or attaching properties to module.exports, you can make them accessible to other modules that require or import that particular module. The exported values can include variables, functions, or even custom objects.
// */
module.exports = connectToMongo;
