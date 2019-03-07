const AWS = require( './Providers/AWS' );

class Provider {
    constructor( configuration, profile ) {
        if ( ! configuration.Provider ) {
			return log.error( 'Configuration.Provider >> REQUIRED' );
		}

        if ( 'aws' == configuration.Provider.Name.toLowerCase() ) {
            this.provider = new AWS( configuration, profile );
        }
    }

    create() {
		this.provider.create();
	}

	deploy() {
        this.provider.deploy();
	}

	update() {
		this.provider.update();
	}

	rollback() {
		this.provider.rollback();
	}

	destroy() {
		this.provider.destroy();
    }
}

module.exports = Provider;
