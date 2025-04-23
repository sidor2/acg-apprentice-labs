# A Cloud Guru labs AWS CDK Stacks

## Description

This repo contains the following stacks:
1. lib/ec2-instance-stack.ts - provisions an Amazon EC2 instance in an existing VPC with a dynamically created key pair, a security group allowing SSH access from the deployer’s public IP, and outputs connection instructions for SSH access.
2. lib/iam-user-customer-policy.ts -  creates a customer-managed IAM policy granting basic S3 permissions, attaches it to an IAM group, and provisions a new IAM user added to that group for controlled S3 access management.
3. lib/three-tier-network.ts - stack provisions a fully networked three-tier architecture with a custom VPC, public and private subnets, security groups, route tables, NAT and Internet gateways, and network ACLs for a SysOps environment.
4. lib/vpc-and-components-stack.ts - stack provisions a custom VPC with public and private subnets, internet gateway, route tables, and network ACLs configured for controlled inbound and outbound traffic.

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

To deploy the AWS CDK stacks, run the following command in the project root directory:

```bash
cdk bootstrap
```

```bash
cdk ls
```

```bash
cdk deploy <stack-name>
```

## Clean Up
To remove the AWS CDK stack and associated resources, run the following command:

```bash
cdk destroy
```
