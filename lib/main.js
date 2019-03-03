var log = require( './Utilities/Logger' ),
	fs = require( 'fs' ),
	path = require( 'path' ),
	Provider = require( './Provider' ),
	Handlebars = require( 'handlebars' ),
	verifyDirectoryExists = require( './Utilities/Utilities' ).verifyDirectoryExists;

/**
 * Cloudlify
 * 
 * The cloud infrastructure launcher.
 */
class Cloudlify {
    constructor( configuration, profile ) {
		this.configuration = configuration;
		this.templatePath = './templates';
		this.partialPath = './partials';

		if ( ! this.configuration ) {
			return log.error( 'Configuration Object >> REQUIRED' );
		}

		// Setup the service provider [AWS|...]
		this.provider = new Provider( this.configuration, profile );
		
		// Register Handlebars items
		this.registerHelpers();
		this.registerPartials();

		// Setup folders
		verifyDirectoryExists( './dist/tmp' );
	}

	create() {
		this.build( ( err, template ) => {
			this.provider.create();
		});
	}

	deploy() {
		this.build( ( err, template ) => {
			this.provider.deploy();
		});
	}

	rollback() {
		this.provider.rollback();
	}

	destroy( really ) {
		this.provider.destroy( really );
	}


	/**
	 * Handlebars Template Build
	 * Recurse through ./templates folder and compile each using Handlebars
	 * @param {*} configuration 
	 * @param {*} base 
	 * @param {*} files 
	 * @param {*} result 
	 */
	build( callback, base, files, result ) {
		var root = this.templatePath;
		var ext = 'yaml';
	
		base = base || '';
		files = files || fs.readdirSync( path.join( root, base ) );
		result = result || [];
	
		files.forEach( ( file ) => {
			var newbase = path.join( root, base, file );
			var f = path.join( base, file );
			if ( fs.statSync( newbase ).isDirectory() ) {
				result = this.build( callback, f, fs.readdirSync( newbase ), result );
			} else {
				if ( file.substr( -1 * ( ext.length + 1 ) ) == '.' + ext ) {
					this.compile( f, callback );
				} 
			}
		} );
	}

	/**
	 * Handlebars Template Compile
	 * Run template through Handlebars and substitute from configuration
	 * @param {*} path Path to template built by Handlebars
	 */
	compile( path, callback ) {
		fs.readFile( `${this.templatePath}/${path}`, 'utf-8', ( err, template ) => {
			var compiledTemplate = Handlebars.compile( template )( this.configuration );

			var writeTo = `./build/${path}`;
			verifyDirectoryExists( writeTo );

			fs.writeFile( writeTo, compiledTemplate, ( err ) => {
				if ( err ) {
					log.error( err );
				} else {
					log.info( `Built >> ./build/${path}` );
				}

				if ( callback ) {
					callback( err, writeTo );
				}
			} );
		} );
	}

	/**
	 * Handlebars Register Helpers
	 */
	registerHelpers() {
		// Value equals helper
		Handlebars.registerHelper("ifvalueof", function(conditional, options) {
			if (conditional == options.hash.equals) {
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		});

		// Increment passed value by 1
		Handlebars.registerHelper( 'inc', function( value, options ) {
			return parseInt( value ) + 1;
		} );
	}

	/**
	 * Handlebars Partials Register
	 * Recurse through partials directory and search for yaml templates to register with Handlebars
	 * @param {*} base Base path to start looking for yaml files
	 * @param {*} files The list of found partial yaml files
	 */
	registerPartials( base, files ) {
		var root = this.partialPath;
		var ext = 'yaml';

		base = base || '';
		files = files || fs.readdirSync( path.join( root, base ) );

		files.forEach( ( file ) => {
			var newbase = path.join( root, base, file );
			var f = path.join( base, file );

			if ( fs.statSync( newbase ).isDirectory() ) {
				this.registerPartials( f, fs.readdirSync( newbase ) );
			} else {
				if ( file.substr( -1 * ( ext.length + 1 ) ) == '.' + ext ) {
					var key = ( base ) ? `${base}/` : base;
					key += path.basename( newbase, `.${ext}` );

					var data = fs.readFileSync( `./${newbase}`, 'utf-8' );
					
					Handlebars.registerPartial( key.replace(/\\/g,"/"), data );
				} 
			}
		} );
	}
}

module.exports = Cloudlify;
