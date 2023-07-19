import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';


export class Ec2InstanceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myIpAddressParameter = new cdk.CfnParameter(this, 'myIpAddress', {
        type: 'String',
        description: 'The IP address of the user'
    });

    const myIpAddress = myIpAddressParameter.valueAsString;

    const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
        vpcId: 'vpc-0724c9f8d721a7c87'
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

    new cdk.CfnOutput(this, 'InstancePublicIp', {
        value: instance.instancePublicIp
    });

    new cdk.CfnOutput(this, 'InstancePublicDnsName', {
        value: instance.instancePublicDnsName
    });

    new cdk.CfnOutput(this, 'keypair1', {
        value: cfnKeyPair.keyName,
        description: 'Name of the keypair'
    });

  }
}