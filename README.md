# EC2 Instance AWS CDK Stack

## Description

This AWS CDK (Cloud Development Kit) stack deploys an EC2 instance in an existing VPC with a security group allowing SSH access from a defined IP address. The stack also creates a new RSA key pair using AWS CloudFormation, associates the key pair with the EC2 instance, and outputs the steps needed to connect to the instance via SSH.

Solution to the ACG lab:
https://learn.acloud.guru/handson/6fc1cc38-73cd-4abf-bdc4-2d718b1f1cd1

## Prerequisites

Before deploying this AWS CDK stack, ensure you have the following:

- AWS CLI installed and configured with the appropriate credentials.
- Node.js and npm installed to execute the CDK deployment.

## Installation

1. Clone this repository to your local machine.
2. Navigate to the project root directory.
3. Install the necessary dependencies by running:

```bash
npm install
```

## Deployment

To deploy the AWS CDK stack, run the following command in the project root directory:

```bash
npx cdk deploy
```

## Connection Steps

After the stack is successfully deployed, follow these steps to connect to the EC2 instance via SSH:

1. Run the following AWS CLI command to retrieve the private key of the key pair:

```bash
aws ssm get-parameter --name /ec2/keypair/keypair1 --with-decryption --query 'Parameter.Value' --output text > keypair1.pem
```

2. Adjust the file permissions for the private key:

```bash
chmod 400 keypair1.pem
```

3. Use the SSH command to connect to the EC2 instance:

```bash
ssh -i keypair1.pem ec2-user@<INSTANCE_PUBLIC_DNS_NAME>
```
Replace <INSTANCE_PUBLIC_DNS_NAME> with the public DNS name of the EC2 instance provided in the CloudFormation outputs.

## Clean Up
To remove the AWS CDK stack and associated resources, run the following command:

```bash
npx cdk destroy
```

This will delete the EC2 instance, security group, key pair, and all related resources from your AWS account.