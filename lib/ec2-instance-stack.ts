// solution to a lab from A Cloud Guru
// https://learn.acloud.guru/handson/6fc1cc38-73cd-4abf-bdc4-2d718b1f1cd1

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';


export class Ec2InstanceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myIpAddress = require('child_process').execSync('curl -s https://checkip.amazonaws.com').toString().trim();


    // The VPC ID needs to be provided in the code below
    const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
        vpcId: 'vpc-0bd2c8e2e89575141'
    });

    const cfnKeyPair = new ec2.CfnKeyPair(this, 'keypair', {
        keyName: 'keypair1',
        keyFormat: 'pem',
        keyType: 'rsa'
      });

    const securityGroup = new ec2.SecurityGroup(this, 'SG1', {
        securityGroupName: 'SG1',
        vpc: vpc,
        allowAllOutbound: true,
    });
    securityGroup.addIngressRule(ec2.Peer.ipv4(`${myIpAddress}/32`), ec2.Port.tcp(22), 'allow ssh access from a defined IP');

    const instance = new ec2.Instance(this, 'Instance', {
        instanceName: 'My Instance',
        vpc: vpc,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
        machineImage: new ec2.AmazonLinuxImage(),
        securityGroup: securityGroup,
        vpcSubnets: {
            subnetType: ec2.SubnetType.PUBLIC,
        },
        keyName: cfnKeyPair.keyName,
        associatePublicIpAddress: true,
    });

    new cdk.CfnOutput(this, 'Step0', {
        value: 'Connection steps: '
    });

    new cdk.CfnOutput(this, 'Step1', {
        value: `1. aws ssm get-parameter --name /ec2/keypair/${cfnKeyPair.attrKeyPairId} --with-decryption --query 'Parameter.Value' --output text > keypair1.pem`
    });

    new cdk.CfnOutput(this, 'Step2', {
        value: `2. chmod 400 keypair1.pem`
    });

    new cdk.CfnOutput(this, 'Step3', {
        value: `3. ssh -i keypair1.pem ec2-user@${instance.instancePublicDnsName}`
    });

  }
}