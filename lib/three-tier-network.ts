// solution to a lab from A Cloud Guru
// https://learn.acloud.guru/handson/f2a24706-8b7b-4a21-9ad6-859bd5595215

// Create a VPC with the following CIDR Block Range (10.99.0.0/16)
// Create six subnets in the VPC you just created: one pair of subnets for the DMZ layer, one pair for the App layer, and one pair for the DB layer. Each pair should be split between AZs.
// Create a NAT Gateway and provide it with a route to the Internet via the public Route Table
// Create three NACLs and associate each to one of the subnet groupings (DMZ, App layer, and DB layer subnets).


import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class ThreeTierNetworkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // VPC named SysOpsVPC with Pv4 CIDR block range: Enter 10.99.0.0/16.
        const vpc = new ec2.CfnVPC(this, 'SysOpsVPC', {
            cidrBlock: '10.99.0.0/16',
            enableDnsHostnames: true,
            enableDnsSupport: true,
            tags: [{ key: 'Name', value: 'SysOpsVPC' }],
            instanceTenancy: 'default'
        });

        // Create six subnets in the VPC you just created: one pair of subnets for the DMZ layer, one pair for the App layer, and one pair for the DB layer. Each pair should be split between AZs.
        const dmzSubnet1 = new ec2.CfnSubnet(this, 'DMZ1public', {
            cidrBlock: '10.99.1.0/24',
            vpcId: vpc.ref,
            availabilityZone: 'us-east-1a',
            mapPublicIpOnLaunch: true,
            tags: [{ key: 'Name', value: 'DMZ1public' }]
        });

        const dmzSubnet2 = new ec2.CfnSubnet(this, 'DMZ2public', {
            cidrBlock: '10.99.2.0/24',
            vpcId: vpc.ref,
            availabilityZone: 'us-east-1b',
            mapPublicIpOnLaunch: true,
            tags: [{ key: 'Name', value: 'DMZ2public' }]
        });

        const appSubnet1 = new ec2.CfnSubnet(this, 'AppLayer1private', {
            cidrBlock: '10.99.11.0/24',
            vpcId: vpc.ref,
            availabilityZone: 'us-east-1a',
            mapPublicIpOnLaunch: false,
            tags: [{ key: 'Name', value: 'AppLayer1private' }]
        });

        const appSubnet2 = new ec2.CfnSubnet(this, 'AppLayer2private', {
            cidrBlock: '10.99.12.0/24',
            vpcId: vpc.ref,
            availabilityZone: 'us-east-1b',
            mapPublicIpOnLaunch: false,
            tags: [{ key: 'Name', value: 'AppLayer2private' }]
        });

        const dbSubnet1 = new ec2.CfnSubnet(this, 'DBLayer1private', {
            cidrBlock: '10.99.21.0/24',
            vpcId: vpc.ref,
            availabilityZone: 'us-east-1a',
            mapPublicIpOnLaunch: false,
            tags: [{ key: 'Name', value: 'DBLayer1private' }]
        });
        
        const dbSubnet2 = new ec2.CfnSubnet(this, 'DBLayer2private', {
            cidrBlock: '10.99.22.0/24',
            vpcId: vpc.ref,
            availabilityZone: 'us-east-1b',
            mapPublicIpOnLaunch: false,
            tags: [{ key: 'Name', value: 'DBLayer2private' }]
        });

        // Create an Internet Gateway and attach it to the VPC
        const igw = new ec2.CfnInternetGateway(this, 'SysOpsIGW', {
            tags: [{ key: 'Name', value: 'SysOpsIGW' }]
        });

        const igwAttachment = new ec2.CfnVPCGatewayAttachment(this, 'SysOpsIGWAttachment', {
            vpcId: vpc.ref,
            internetGatewayId: igw.ref
        });

        // Create a NAT Gateway and provide it with a route to the Internet via the public Route Table
        const eip = new ec2.CfnEIP(this, 'SysOpsEIP', {
            domain: 'vpc'
        });

        const natGateway = new ec2.CfnNatGateway(this, 'SysOpsNATGateway', {
            allocationId: eip.attrAllocationId,
            subnetId: dmzSubnet1.ref,
            tags: [{ key: 'Name', value: 'SysOpsNATGateway' }]
        });

        const publicRouteTable = new ec2.CfnRouteTable(this, 'SysOpsPublicRouteTable', {
            vpcId: vpc.ref,
            tags: [{ key: 'Name', value: 'SysOpsPublicRouteTable' }]
        });

        const publicRoute = new ec2.CfnRoute(this, 'SysOpsPublicRoute', {
            routeTableId: publicRouteTable.ref,
            destinationCidrBlock: '0.0.0.0/0',
            gatewayId: igw.ref
        });



    }
}

