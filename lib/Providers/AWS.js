var shell = require( 'shelljs' ),
    log = require( './../Utilities/Logger' );

/**
 * Provider
 * AWS
 */
class AWS {
    constructor( configuration, profile ) {
        this.configuration = configuration;

        this.commands = {
            login: `eval "$( aws ecr get-login --no-include-email --region ${configuration.Provider.Region} ${profile} )"`,
            package: `aws cloudformation package --template ./build/${configuration.Build.Template}.yaml --s3-bucket ${configuration.Provider.Bucket} --output-template-file ./dist/package.yaml --region ${configuration.Provider.Region} ${profile}`,
            deploy: `aws cloudformation deploy --template-file ./dist/package.yaml --stack-name ${configuration.Stack.Name} --s3-bucket ${configuration.Provider.Bucket} --capabilities CAPABILITY_NAMED_IAM --region ${configuration.Provider.Region} ${profile}`,
            listChangeSets: `aws cloudformation list-change-sets --stack-name ${configuration.Stack.Name} ${profile}`,
            executeChangeSet: `aws cloudformation execute-change-set --stack-name ${configuration.Stack.Name} ${profile}`,
            describeStack: `aws cloudformation describe-stacks --stack-name ${configuration.Stack.Name} ${profile}`,
            stackEvents: `aws cloudformation describe-stack-events --stack-name ${configuration.Stack.Name} ${profile}`,
            protectStack: `aws cloudformation update-termination-protection --enable-termination-protection --stack-name ${configuration.Stack.Name} ${profile}`,
            unprotectStack: `aws cloudformation update-termination-protection --no-enable-termination-protection --stack-name ${configuration.Stack.Name} ${profile}`,
            deleteStack: `aws cloudformation delete-stack --stack-name ${configuration.Stack.Name} --region ${configuration.Provider.Region} ${profile}`,
            setup: `(aws s3api get-bucket-location --bucket ${configuration.Provider.Bucket} --region ${configuration.Provider.Region} ${profile} || aws s3 mb s3://${configuration.Provider.Bucket} --region ${configuration.Provider.Region} ${profile})`,
            deleteBucket: `aws s3 rm s3://${configuration.Provider.Bucket} --region ${configuration.Provider.Region} --recursive && aws s3 rb s3://${configuration.Provider.Bucket} --region ${configuration.Provider.Region} ${profile}`
        };
    }

    create() {
        // build it up
        this.execute( `${this.commands.setup} && ${this.commands.package} && ${this.commands.deploy} && ${this.commands.protectStack}` );
	}

	deploy() {
        // deploy it / update it
        this.execute( `${this.commands.package} && ${this.commands.deploy}` );
	}

    update() {
        // update associated service containers by triggering a force deploy with new images
        this.updateServices();
    }

	rollback() {
		// nope
	}

	destroy() {
        // burn it down
        // You will need to manually unprotect the stack. Intentional thinking it may be wise.
        this.execute( `${this.commands.deleteStack} && ${this.commands.deleteBucket}` );
    }



    login() {
		this.execute( this.commands.login );
    }

	listChangeSets() {
		this.execute( this.commands.listChangeSets );
	}

	executeChangeSet( changeSetName ) {
		this.execute( `${this.commands.executeChangeSet} --change-set-name ${changeSetName}` );
	}

	describeStack() {
		this.execute( this.commands.describeStack );
	}

	stackEvents() {
		this.execute( this.commands.stackEvents );
    }
    
    /**
     * Update all ECS Services by forcing a new container deployment
     */
    updateServices() {
        var services = this.getServices();

        for ( var i = 0; i < services.length; i++ ) {
            this.execute( `aws ecs update-service --cluster ${this.configuration.Stack.Name} --service ${services[i]} --force-new-deployment` );
        }
    }

    /**
     * Get a list of Services based on the configuration
     */
    getServices() {
        var services = [];

        if ( this.configuration.Service ) {
            services.push( this.configuration.Service.Name );
        } else if ( this.configuration.Stack.VPC.Hosts ) {
            var hosts = this.configuration.Stack.VPC.Hosts;

            for ( var i = 0; i < hosts.length; i++ ) {
                var host = hosts[i];

                if ( host.Services ) {
                    for ( var j = 0; j < host.Services.length; j++ ) {
                        services.push( host.Services[ j ].Name );
                    }
                }
            }
        }

        return services;
    }
    
    execute( command, callback ) {
        if ( command ) {
            log.info( `>> ${command}` );
            shell.exec( command, callback );
        }
    }
}

module.exports = AWS;
