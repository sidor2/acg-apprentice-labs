// VPC1
// 172.16.0.0/16

// Public1 subnet in us-east-1a: 172.16.1.0/24
// Private1 subnet in us-east-1b: 172.16.2.0/24

// PublicNACL with inbound rules allowing HTTP and SSH traffic, as well as an outbound rule allowing traffic on port range 1024-65535
// Associate the public NACL with the public subnet.

// PrivateNACL with an inbound rule allowing SSH traffic with a source of 172.16.1.0/24, as well as an outbound rule allowing traffic on port range 1024-65535.
// Associate the private NACL with the private subnet.

// internet gateway named IGW, and attach it to the VPC

// Create two route tables:
// One for the public subnet with an internet gateway route, named PublicRT
// One for the private subnet without an internet gateway route, named PrivateRT
// For the public route table, create a default route to the internet using the 0.0.0.0/0 CIDR notation.

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VpcAndComponentsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // create a VPC
        const vpc = new ec2.Vpc(this, 'VPC1', {
            ipAddresses: ec2.IpAddresses.cidr('172.16.0.0/16')
        });

        // create a subnet and attach to the VPC
        const publicSubnet = new ec2.PublicSubnet(this, 'Public1', {
            vpcId: vpc.vpcId,
            availabilityZone: 'us-east-1a',
            cidrBlock: '172.16.1.0/24',
            mapPublicIpOnLaunch: true   
        });

        // create a private subnet and attach to the VPC
        const privateSubnet = new ec2.PrivateSubnet(this, 'Private1', {
            vpcId: vpc.vpcId,
            availabilityZone: 'us-east-1b',
            cidrBlock: '172.16.2.0/24',
            mapPublicIpOnLaunch: false
        });

        // PublicNACL with inbound rules allowing HTTP and SSH traffic, as well as an outbound rule allowing traffic on port range 1024-65535
        // Associate the public NACL with the public subnet.
        const publicNacl = new ec2.NetworkAcl(this, 'PublicNACL', {
            vpc: vpc,
            subnetSelection: { subnetType: ec2.SubnetType.PUBLIC },
            networkAclName: 'PublicNACL',
        });

        publicSubnet.associateNetworkAcl('PublicNACL', publicNacl);
    }
}