# Cloudlify

The simple cloud infrastructure launcher using Handlebars for template processing.

## Help

Use the Cloudlify npm module to compile and execute cloud service provider commands.

Cloudlify uses Handlebars for merging the JSON formatted configuration file into the final template.

*Currently we have AWS as a provider.*

## Usage Example

./app.js
```
const Cloudlify = require( 'cloudlify' ),
    configuration = require( './config/common' );

var cloudlify = new Cloudlify( configuration, '{ optional non default aws profile name for aws cli }' );

cloudlify.create();
```

## Configuration Example
./config/common.js
```
require( 'dotenv' ).config();

class Configuration {
	constructor() {
		this.Provider = 'AWS';
		this.Environment = process.env.ENVIRONMENT || 'development';
		this.StackName = 'my-stack-prod';
		this.Region = 'us-east-1';

		this.Build = {
			Template: 'master'
		};
		
		this.AWSCLI = {
			S3Bucket: `${this.StackName}-deploy`
		};

		this.SecurityGroups = {
			PublicCidr: '0.0.0.0/0'
		};

		this.VPC = {
			Id: 'vpc-someidhere',
			SubnetId: 'subnet-someidhere',
			OpenPorts: [ 80, 443, 22, 3306 ]
		};

		this.Host = {
			ID: 'MyHostID',
			KeyName: 'myawskey',
			InstanceType: 't3.micro',
			ElasticIPAllocationId: 'eipalloc-someidhereifyouhaveone'
		};

		this.Service = {
			Name: `${this.StackName}-web-service`,
			Web: {
				Image: 'wordpress:latest',
				Host: 'www.domainname.com'
			},
			DB: {
				Image: 'mariadb:latest'
			},
			Proxy: {
				Image: 'jwilder/nginx-proxy'
			}
		};

		this.Logs = {
			RetentionInDays: 1
		};
	}
}

module.exports = Configuration;
```

## Folders

Cloudlify uses the following folders relative to where the package is called.

* Configurations: `./config`
* Master templates: `./templates`
* Partial templates: `./partials`
* Build output: `./build`
* Compiled output: `./dist`


## Roadmap

* Test library
* Linting
* Convert to TypeScript
* Add more Providers
* Kubernetes ready
* Refactoring

## Contributions

All contributions welcome! Branch off master and submit a pull request for review.
