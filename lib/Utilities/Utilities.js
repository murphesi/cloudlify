var fs = require( 'fs' ),
    path = require( 'path' );

/**
 * Make sure path to file exists otherwise create it
 * @param {*} filePath 
 */
var verifyDirectoryExists  = function( filePath ) {
    var dirname = path.dirname( filePath );

    if ( fs.existsSync( dirname ) ) {
        return true;
    }

    verifyDirectoryExists( dirname );

    fs.mkdirSync( dirname );
}

module.exports.verifyDirectoryExists = verifyDirectoryExists;