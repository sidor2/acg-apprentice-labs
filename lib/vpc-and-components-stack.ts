// solution to a lab from A Cloud Guru
// https://learn.acloud.guru/handson/2cc3cf9e-61ce-475d-a00e-03306e9ba285

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VpcAndComponentsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // create a VPC using CfnVPC
        const vpc = new ec2.CfnVPC(this, 'VPC', {
            cidrBlock: '172.16.0.0/16',
            enableDnsHostnames: true,
            enableDnsSupport: true,
            tags: [{ key: 'Name', value: 'VPC1' }],
            instanceTenancy: 'default'
        });

        // internet gateway named IGW, and attach it to the VPC
        const igw = new ec2.CfnInternetGateway(this, 'IGW', {
            tags: [{ key: 'Name', value: 'IGW' }],
        });

        new ec2.CfnVPCGatewayAttachment(this, 'IGWAttachment', {
            vpcId: vpc.ref,
            internetGatewayId: igw.ref,
        });

        // Public1 subnet in us-east-1a:
        const public1Subnet = new ec2.CfnSubnet(this, 'Public1Subnet', {
            cidrBlock: '172.16.1.0/24',
            vpcId: vpc.ref,
            availabilityZone: 'us-east-1a',
            mapPublicIpOnLaunch: true,
            tags: [{ key: 'Name', value: 'Public1Subnet' }],
        });

        // PublicNACL with inbound rules allowing HTTP and SSH traffic, as well as an outbound rule allowing traffic on port range 1024-65535
        // Associate the public NACL with the public subnet.
        const publicNacl = new ec2.CfnNetworkAcl(this, 'PublicNACL', {
            vpcId: vpc.ref,
            tags: [{ key: 'Name', value: 'PublicNACL' }],
        });

        new ec2.CfnNetworkAclEntry(this, 'PublicNACLInboundHTTP', {
            networkAclId: publicNacl.ref,
            ruleNumber: 100,
            protocol: 6,
            ruleAction: 'allow',
            cidrBlock: '0.0.0.0/0',
            egress: false,
            portRange: {
                from: 80,
                to: 80,
            },
        });

        new ec2.CfnNetworkAclEntry(this, 'PublicNACLInboundSSH', {
            networkAclId: publicNacl.ref,
            ruleNumber: 110,
            protocol: 6,
            ruleAction: 'allow',
            cidrBlock: '0.0.0.0/0',
            egress: false,
            portRange: {
                from: 22,
                to: 22,
            },
        });

        new ec2.CfnNetworkAclEntry(this, 'PublicNACLOutbound', {
            networkAclId: publicNacl.ref,
            ruleNumber: 100,
            protocol: 6,
            ruleAction: 'allow',
            cidrBlock: '0.0.0.0/0',
            egress: true,
            portRange: {
                from: 1024,
                to: 65535,
            },
        });

        new ec2.CfnSubnetNetworkAclAssociation(this, 'PublicNACLAssociation', {
            subnetId: public1Subnet.ref,
            networkAclId: publicNacl.ref,
        });

        // Create route table for the public subnet with an internet gateway route, named PublicRT
        const publicRouteTable = new ec2.CfnRouteTable(this, 'PublicRouteTable', {
            vpcId: vpc.ref,
            tags: [{ key: 'Name', value: 'PublicRT' }],
        });

        new ec2.CfnRoute(this, 'PublicRoute', {
            routeTableId: publicRouteTable.ref,
            destinationCidrBlock: '0.0.0.0/0',
            gatewayId: igw.ref,
        });

        new ec2.CfnSubnetRouteTableAssociation(this, 'PublicRouteTableAssociation', {
            routeTableId: publicRouteTable.ref,
            subnetId: public1Subnet.ref,
        });

        // Private1 subnet in us-east-1b:
        const private1Subnet = new ec2.CfnSubnet(this, 'Private1Subnet', {
            cidrBlock: '172.16.2.0/24',
            vpcId: vpc.ref,
            availabilityZone: 'us-east-1b',
            mapPublicIpOnLaunch: false,
            tags: [{ key: 'Name', value: 'Private1Subnet' }],
        });

        // PrivateNACL with an inbound rule allowing SSH traffic with a source of 172.16.1.0/24, as well as an outbound rule allowing traffic on port range 1024-65535.
        // Associate the private NACL with the private subnet.
        const privateNacl = new ec2.CfnNetworkAcl(this, 'PrivateNACL', {
            vpcId: vpc.ref,
            tags: [{ key: 'Name', value: 'PrivateNACL' }],
        });
        
        new ec2.CfnNetworkAclEntry(this, 'PrivateNACLInboundSSH', {
            networkAclId: privateNacl.ref,
            ruleNumber: 100,
            protocol: 6,
            ruleAction: 'allow',
            cidrBlock: '172.16.1.0/24',
            egress: false,
            portRange: {
                from: 22,
                to: 22,
            },
        });

        new ec2.CfnNetworkAclEntry(this, 'PrivateNACLOutbound', {
            networkAclId: privateNacl.ref,
            ruleNumber: 100,
            protocol: 6,
            ruleAction: 'allow',
            cidrBlock: '172.16.1.0/24',
            egress: true,
            portRange: {
                from: 1024,
                to: 65535,
            },
        });

        new ec2.CfnSubnetNetworkAclAssociation(this, 'PrivateNACLAssociation', {
            subnetId: private1Subnet.ref,
            networkAclId: privateNacl.ref,
        });

        // Create route table for the private subnet without an internet gateway route, named PrivateRT
        const privateRouteTable = new ec2.CfnRouteTable(this, 'PrivateRouteTable', {
            vpcId: vpc.ref,
            tags: [{ key: 'Name', value: 'PrivateRT' }],
        });

        new ec2.CfnSubnetRouteTableAssociation(this, 'PrivateRouteTableAssociation', {
            routeTableId: privateRouteTable.ref,
            subnetId: private1Subnet.ref,
        });

    }
}