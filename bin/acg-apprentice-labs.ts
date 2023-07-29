#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { Ec2InstanceStack } from '../lib/ec2-instance-stack';
import { VpcAndComponentsStack } from '../lib/vpc-and-components-stack';
import { IamUserCustomerPolicyStack } from '../lib/iam-user-customer-policy';
import { ThreeTierNetworkStack } from '../lib/three-tier-network';

const app = new cdk.App();
new Ec2InstanceStack(app, 'Ec2InstanceStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

new VpcAndComponentsStack(app, 'VpcAndComponentsStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

new IamUserCustomerPolicyStack(app, 'IamUserCustomerPolicyStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

new ThreeTierNetworkStack(app, 'ThreeTierNetworkStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});