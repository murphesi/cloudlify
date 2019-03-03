const AWS = require( './Providers/AWS' );

class Provider {
    constructor( configuration, profile ) {
        this.configuration = configuration;

        if ( ! this.configuration.Provider ) {
			return log.error( 'Configuration.Provider >> REQUIRED' );
		}

        if ( 'aws' == this.configuration.Provider.toLowerCase() ) {
            this.provider = new AWS( this.configuration, profile );
        }
    }

    create() {
		this.provider.create();
	}

	deploy() {
        this.provider.deploy();
	}

	rollback() {
		this.provider.rollback();
	}

	destroy() {
		this.provider.destroy();
    }
}

module.exports = Provider;
