// solution to labs from A Cloud Guru
// https://learn.acloud.guru/handson/f2a24706-8b7b-4a21-9ad6-859bd5595215
// https://learn.acloud.guru/handson/c8f78dd1-2c83-4058-b480-cf96a4e78e13

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

        // create security groups for each layer
        const BastionSecurityGroup = new ec2.CfnSecurityGroup(this, 'BastionSecurityGroup', {
            groupName: 'BastionSecurityGroup',
            groupDescription: 'BastionSecurityGroup',
            vpcId: vpc.ref,
            securityGroupIngress: [
                {
                    ipProtocol: 'tcp',
                    fromPort: 22,
                    toPort: 22,
                    cidrIp: '0.0.0.0/0'
                }
            ],
            securityGroupEgress: [],
            tags: [{ key: 'Name', value: 'BastionSecurityGroup' }]
        });

        const ALBSecurityGroup = new ec2.CfnSecurityGroup(this, 'ALBSecurityGroup', {
            groupName: 'ALBSecurityGroup',
            groupDescription: 'ALBSecurityGroup',
            vpcId: vpc.ref,
            securityGroupIngress: [
                {
                    ipProtocol: 'tcp',
                    fromPort: 80,
                    toPort: 80,
                    cidrIp: '0.0.0.0/0'
                }
            ],
            tags: [{ key: 'Name', value: 'ALBSecurityGroup' }]
        });

        const appSecurityGroup = new ec2.CfnSecurityGroup(this, 'AppSecurityGroup', {
            groupName: 'AppSecurityGroup',
            groupDescription: 'AppSecurityGroup',
            vpcId: vpc.ref,
            securityGroupIngress: [
                {
                    ipProtocol: 'tcp',
                    fromPort: 80,
                    toPort: 80,
                    sourceSecurityGroupId: ALBSecurityGroup.attrGroupId
                },
                {
                    ipProtocol: 'tcp',
                    fromPort: 22,
                    toPort: 22,
                    sourceSecurityGroupId: BastionSecurityGroup.attrGroupId
                }
            ],
            tags: [{ key: 'Name', value: 'AppSecurityGroup' }]
        });

        const dbSecurityGroup = new ec2.CfnSecurityGroup(this, 'DbSecurityGroup', {
            groupName: 'DbSecurityGroup',
            groupDescription: 'DbSecurityGroup',
            vpcId: vpc.ref,
            securityGroupIngress: [
                {
                    ipProtocol: 'tcp',
                    fromPort: 3306,
                    toPort: 3306,
                    sourceSecurityGroupId: appSecurityGroup.attrGroupId
                }
            ],
            tags: [{ key: 'Name', value: 'DbSecurityGroup' }]
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

        const privateRouteTable = new ec2.CfnRouteTable(this, 'SysOpsPrivateRouteTable', {
            vpcId: vpc.ref,
            tags: [{ key: 'Name', value: 'SysOpsPrivateRouteTable' }]
        });

        const privateRoute = new ec2.CfnRoute(this, 'SysOpsPrivateRoute', {
            routeTableId: privateRouteTable.ref,
            destinationCidrBlock: '0.0.0.0/0',
            natGatewayId: natGateway.ref
        });

        // Associate the public Route Table with the DMZ subnets and the private Route Table with the App and DB subnets.
        const dmzSubnet1RouteTableAssociation = new ec2.CfnSubnetRouteTableAssociation(this, 'DMZSubnet1RouteTableAssociation', {
            subnetId: dmzSubnet1.ref,
            routeTableId: publicRouteTable.ref
        });

        const dmzSubnet2RouteTableAssociation = new ec2.CfnSubnetRouteTableAssociation(this, 'DMZSubnet2RouteTableAssociation', {
            subnetId: dmzSubnet2.ref,
            routeTableId: publicRouteTable.ref
        });

        const appSubnet1RouteTableAssociation = new ec2.CfnSubnetRouteTableAssociation(this, 'AppSubnet1RouteTableAssociation', {
            subnetId: appSubnet1.ref,
            routeTableId: privateRouteTable.ref
        });

        const appSubnet2RouteTableAssociation = new ec2.CfnSubnetRouteTableAssociation(this, 'AppSubnet2RouteTableAssociation', {
            subnetId: appSubnet2.ref,
            routeTableId: privateRouteTable.ref
        });

        const dbSubnet1RouteTableAssociation = new ec2.CfnSubnetRouteTableAssociation(this, 'DBSubnet1RouteTableAssociation', {
            subnetId: dbSubnet1.ref,
            routeTableId: privateRouteTable.ref
        });

        const dbSubnet2RouteTableAssociation = new ec2.CfnSubnetRouteTableAssociation(this, 'DBSubnet2RouteTableAssociation', {
            subnetId: dbSubnet2.ref,
            routeTableId: privateRouteTable.ref
        });

        // Create three NACLs and associate each to one of the subnet groupings (DMZ, App layer, and DB layer subnets).
        const dmzNacl = new ec2.CfnNetworkAcl(this, 'DMZNacl', {
            vpcId: vpc.ref,
            tags: [{ key: 'Name', value: 'DMZNacl' }]
        });

        const dmzNaclEntry1 = new ec2.CfnNetworkAclEntry(this, 'DMZNaclEntry1', {
            networkAclId: dmzNacl.ref,
            ruleNumber: 100,
            protocol: 6,
            ruleAction: 'allow',
            egress: false,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 22, to: 22 }
        });

        const dmzNaclEntry2 = new ec2.CfnNetworkAclEntry(this, 'DMZNaclEntry2', {
            networkAclId: dmzNacl.ref,
            ruleNumber: 100,
            protocol: 6,
            ruleAction: 'allow',
            egress: true,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 22, to: 22 }
        });

        const dmzNaclEntry3 = new ec2.CfnNetworkAclEntry(this, 'DMZNaclEntry3', {
            networkAclId: dmzNacl.ref,
            ruleNumber: 110,
            protocol: 6,
            ruleAction: 'allow',
            egress: false,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 80, to: 80 }
        });

        const dmzNaclEntry4 = new ec2.CfnNetworkAclEntry(this, 'DMZNaclEntry4', {
            networkAclId: dmzNacl.ref,
            ruleNumber: 110,
            protocol: 6,
            ruleAction: 'allow',
            egress: true,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 80, to: 80 }
        });

        const dmzNaclEntry5 = new ec2.CfnNetworkAclEntry(this, 'DMZNaclEntry5', {
            networkAclId: dmzNacl.ref,
            ruleNumber: 120,
            protocol: 6,
            ruleAction: 'allow',
            egress: false,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 443, to: 443 }
        });

        const dmzNaclEntry6 = new ec2.CfnNetworkAclEntry(this, 'DMZNaclEntry6', {
            networkAclId: dmzNacl.ref,
            ruleNumber: 120,
            protocol: 6,
            ruleAction: 'allow',
            egress: true,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 443, to: 443 }
        });

        const dmzNaclEntry7 = new ec2.CfnNetworkAclEntry(this, 'DMZNaclEntry7', {
            networkAclId: dmzNacl.ref,
            ruleNumber: 130,
            protocol: 6,
            ruleAction: 'allow',
            egress: false,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 1024, to: 65535 }
        });

        const dmzNaclEntry8 = new ec2.CfnNetworkAclEntry(this, 'DMZNaclEntry8', {
            networkAclId: dmzNacl.ref,
            ruleNumber: 130,
            protocol: 6,
            ruleAction: 'allow',
            egress: true,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 1024, to: 65535 }
        });

        const appNacl = new ec2.CfnNetworkAcl(this, 'AppNacl', {
            vpcId: vpc.ref,
            tags: [{ key: 'Name', value: 'AppNacl' }]
        });

        const appNaclEntry1 = new ec2.CfnNetworkAclEntry(this, 'AppNaclEntry1', {
            networkAclId: appNacl.ref,
            ruleNumber: 100,
            protocol: 6,
            ruleAction: 'allow',
            egress: false,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 80, to: 80 }
        });

        const appNaclEntry2 = new ec2.CfnNetworkAclEntry(this, 'AppNaclEntry2', {
            networkAclId: appNacl.ref,
            ruleNumber: 100,
            protocol: 6,
            ruleAction: 'allow',
            egress: true,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 80, to: 80 }
        });

        const appNaclEntry3 = new ec2.CfnNetworkAclEntry(this, 'AppNaclEntry3', {
            networkAclId: appNacl.ref,
            ruleNumber: 110,
            protocol: 6,
            ruleAction: 'allow',
            egress: false,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 1024, to: 65535 }
        });

        const appNaclEntry4 = new ec2.CfnNetworkAclEntry(this, 'AppNaclEntry4', {
            networkAclId: appNacl.ref,
            ruleNumber: 110,
            protocol: 6,
            ruleAction: 'allow',
            egress: true,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 1024, to: 65535 }
        });

        const dbNacl = new ec2.CfnNetworkAcl(this, 'DBNacl', {
            vpcId: vpc.ref,
            tags: [{ key: 'Name', value: 'DBNacl' }]
        });

        const dbNaclEntry1 = new ec2.CfnNetworkAclEntry(this, 'DBNaclEntry1', {
            networkAclId: dbNacl.ref,
            ruleNumber: 100,
            protocol: 6,
            ruleAction: 'allow',
            egress: false,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 3306, to: 3306 }
        });

        const dbNaclEntry2 = new ec2.CfnNetworkAclEntry(this, 'DBNaclEntry2', {
            networkAclId: dbNacl.ref,
            ruleNumber: 100,
            protocol: 6,
            ruleAction: 'allow',
            egress: true,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 3306, to: 3306 }
        });

        const dbNaclEntry3 = new ec2.CfnNetworkAclEntry(this, 'DBNaclEntry3', {
            networkAclId: dbNacl.ref,
            ruleNumber: 110,
            protocol: 6,
            ruleAction: 'allow',
            egress: false,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 1024, to: 65535 }
        });

        const dbNaclEntry4 = new ec2.CfnNetworkAclEntry(this, 'DBNaclEntry4', {
            networkAclId: dbNacl.ref,
            ruleNumber: 110,
            protocol: 6,
            ruleAction: 'allow',
            egress: true,
            cidrBlock: '0.0.0.0/0',
            portRange: { from: 1024, to: 65535 }
        });

        // Associate the NACLs with the appropriate subnets
        const dmzNaclAssociation1 = new ec2.CfnSubnetNetworkAclAssociation(this, 'DMZNaclAssociation1', {
            subnetId: dmzSubnet1.ref,
            networkAclId: dmzNacl.ref
        });

        const dmzNaclAssociation2 = new ec2.CfnSubnetNetworkAclAssociation(this, 'DMZNaclAssociation2', {
            subnetId: dmzSubnet2.ref,
            networkAclId: dmzNacl.ref
        });

        const appNaclAssociation1 = new ec2.CfnSubnetNetworkAclAssociation(this, 'AppNaclAssociation1', {
            subnetId: appSubnet1.ref,
            networkAclId: appNacl.ref
        });

        const appNaclAssociation2 = new ec2.CfnSubnetNetworkAclAssociation(this, 'AppNaclAssociation2', {
            subnetId: appSubnet2.ref,
            networkAclId: appNacl.ref
        });

        const dbNaclAssociation1 = new ec2.CfnSubnetNetworkAclAssociation(this, 'DBNaclAssociation1', {
            subnetId: dbSubnet1.ref,
            networkAclId: dbNacl.ref
        });

        const dbNaclAssociation2 = new ec2.CfnSubnetNetworkAclAssociation(this, 'DBNaclAssociation2', {
            subnetId: dbSubnet2.ref,
            networkAclId: dbNacl.ref
        });

    }
}

