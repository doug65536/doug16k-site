/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

module.exports.makeResultDumper = makeResultDumper;
module.exports.makeErrorDumper = makeErrorDumper;

function makeResultDumper(description) {
    return function(value) {
        console.log(description + ':', value);
        return value;
    };
}

function makeErrorDumper(description) {
    return function(value) {
        console.error(description + ':', value);
        throw value;
    };
}
