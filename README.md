# A Cloud Guru labs AWS CDK Stacks

## Description

This repo contains stacks which deploy solutions to A Cloud Guru Apprentice level labs from the Security topic.

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
npx cdk ls
```

```bash
npx cdk deploy <stack-name>
```

## Clean Up
To remove the AWS CDK stack and associated resources, run the following command:

```bash
npx cdk destroy
```