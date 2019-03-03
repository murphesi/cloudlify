var shell = require( 'shelljs' ),
    log = require( './../Utilities/Logger' );

/**
 * Provider
 * AWS
 */
class AWS {
    constructor( configuration, profile ) {
        this.commands = {
            login: `eval "$( aws ecr get-login --no-include-email --region ${configuration.Region} ${profile} )"`,
            package: `aws cloudformation package --template ./build/${configuration.Build.Template}.yaml --s3-bucket ${configuration.AWSCLI.S3Bucket} --output-template-file ./dist/package.yaml --region ${configuration.Region} ${profile}`,
            deploy: `aws cloudformation deploy --template-file ./dist/package.yaml --stack-name ${configuration.StackName} --s3-bucket ${configuration.AWSCLI.S3Bucket} --capabilities CAPABILITY_NAMED_IAM --region ${configuration.Region} ${profile}`,
            listChangeSets: `aws cloudformation list-change-sets --stack-name ${configuration.StackName} ${profile}`,
            executeChangeSet: `aws cloudformation execute-change-set --stack-name ${configuration.StackName} ${profile}`,
            describeStack: `aws cloudformation describe-stacks --stack-name ${configuration.StackName} ${profile}`,
            stackEvents: `aws cloudformation describe-stack-events --stack-name ${configuration.StackName} ${profile}`,
            protectStack: `aws cloudformation update-termination-protection --enable-termination-protection --stack-name ${configuration.StackName} ${profile}`,
            unprotectStack: `aws cloudformation update-termination-protection --no-enable-termination-protection --stack-name ${configuration.StackName} ${profile}`,
            deleteStack: `aws cloudformation delete-stack --stack-name ${configuration.StackName} --region ${configuration.Region} ${profile}`,
            updateService: `aws ecs update-service --cluster ${configuration.StackName} --service ${configuration.Service.Name} --force-new-deployment`,
            setup: `(aws s3api get-bucket-location --bucket ${configuration.AWSCLI.S3Bucket} --region ${configuration.Region} ${profile} || aws s3 mb s3://${configuration.AWSCLI.S3Bucket} --region ${configuration.Region} ${profile})`,
            deleteBucket: `aws s3 rm s3://${configuration.AWSCLI.S3Bucket} --region ${configuration.Region} --recursive && aws s3 rb s3://${configuration.AWSCLI.S3Bucket} --region ${configuration.Region} ${profile}`
        };
    }

    create() {
        // build it up
        this.execute( `${this.commands.setup} && ${this.commands.package} && ${this.commands.deploy} && ${this.commands.protectStack}` );
	}

	deploy() {
        // deploy it / update it
        this.execute( `${this.commands.package} && ${this.commands.deploy}` );
        // this.execute( this.commands.updateService );
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

    
    execute( command ) {
        if ( command ) {
            log.info( `>> ${command}` );
            shell.exec( command );
        }
    }
}

module.exports = AWS;
