var winston = require( 'winston' );

var logger = null;

class Logger {
	constructor() {
		if ( ! logger ) {
			// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
			logger = new ( winston.Logger )( {
				transports: [
					new ( winston.transports.Console )( {
						colorize: true,
						timestamp: true,
						level: process.env.LOG_LEVEL || 'silly'
					} )
				]
			} );
		}
	}

	info( message ) {
		logger.info( message );
	}

	warn( message ) {
		logger.warn( message );
	}

	error( message ) {
		logger.error( message );
	}
}

module.exports = new Logger;
