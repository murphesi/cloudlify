# Cloudlify

The simple cloud infrastructure launcher using Handlebars for template processing.

**NOTE: Stack template examples will be posted shortly!**

Use the Cloudlify npm module to compile yaml templates and execute cloud service provider commands.

Cloudlify uses Handlebars for merging the JSON formatted configuration file into the final template.

*Currently we have AWS as a provider.*

## Install

```
npm install --save cloudlify
```

## Requirements

Depending on the provider, which currently is only AWS, you will need the AWS CLI tools installed.

* AWS CLI tools - https://aws.amazon.com/cli/
* Amazon account with proper IAM roles/policies to access all the services you are deploying
* AWS Access Key: IAM > User > Security Credentials > Access Keys ( Create Access Key )
* AWS CLI Credentials locally - Create a folder under your profile for aws credentials ~/.aws ( MacOS )

## Multiple AWS Profile Examples

~/.aws/config
```
[default]
output = text
region = us-east-1
[profile other]
region = us-west-2
```

~/.aws/credentials
```
[default]
aws_access_key_id = 
aws_secret_access_key = 
[other]
aws_access_key_id = 
aws_secret_access_key = 
```

## Usage Example

./app.js
```
const Cloudlify = require( 'cloudlify' ),
	yaml = require( 'yamljs' );
	
var configuration = yaml.load( './config/common.yaml' );

var cloudlify = new Cloudlify( configuration, '{ optional non default aws profile name for aws cli }' );

cloudlify.create();
```

## Configuration Example
./config/common.yaml
```
# AWS Cloud Configuration
# Required: ./templates/master.yaml ( Handlebars template )

Stack:
  Name: my-stack-prod

Build:
  Template: master
  Environment: development

Provider:
  Name: AWS
  Region: us-east-1
  Bucket: my-deploy-bucket

SecurityGroups:
  PublicCidr: 0.0.0.0/0

VPC:
  Id: vpc-someidhere
  SubnetId: subnet-someidhere
  OpenPorts:
    - 80
    - 443
    - 22
    - 3306

Host:
  ID: MyHostID
  KeyName: myawskey
  InstanceType: t3.micro
  ElasticIPAllocationId: eipalloc-someidhereifyouhaveone

Service:
  Name: MyServiceName
  Containers:
    - Name: Web
      Image: wordpress:latest
      Host: www.domain.com
    - Name: DB
      Image: mariadb:latest
    - Name: Proxy
      Image: jwilder/nginx-proxy
    - Name: LetsEncrypt
      Image: jrcs/letsencrypt-nginx-proxy-companion

Logs:
  RetentionInDays: 1

```

## Folders

Cloudlify uses the following folders relative to where the package is called.

* Configurations: `./config`
* Master templates: `./templates`
* Partial templates: `./partials`
* Build output: `./build`
* Compiled output: `./dist`


## Roadmap

* Full example project with templates
* Test library
* Linting
* Convert to TypeScript
* Add more Providers
* Kubernetes ready
* Refactoring

## Contributions

All contributions welcome! Branch off master and submit a pull request for review.

## History

- 0.0.6 - Move force update of services to update() function
- 0.0.5 - Update example to use yaml for configuration. It's just better ;)
- 0.0.4 - Check if multiple host services are configured when running an updateService command.
- 0.0.3 - Refactor AWS commands and configuration structure.
- 0.0.1 - Initialize!
