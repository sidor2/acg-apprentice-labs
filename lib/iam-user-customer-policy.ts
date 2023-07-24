// solution to a lab from A Cloud Guru
// https://learn.acloud.guru/handson/e22c68b9-e020-45fa-8c46-9cd17eb986e6


// Create a Group Controlled via a Customer-Managed Policy Using AWS IAM
// Create a New User and Assign It to a Group Using AWS IAM

import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class IamUserCustomerPolicyStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create a Customer-Managed Policy Using AWS IAM allowing access to S3
        const S3Statement = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                "s3:ListAllMyBuckets",
                "s3:GetBucketLocation"
            ],
            resources: [
                "*"
            ]
        });

        const S3Policy = new iam.Policy(this, 'S3Policy', {
            policyName: 'S3Policy',
            statements: [S3Statement]
        });

        // Create a Group Controlled via a Customer-Managed Policy Using AWS IAM
        const S3Group = new iam.Group(this, 'S3Group', {
            groupName: 'S3Group'
        });

        S3Group.attachInlinePolicy(S3Policy);

        // Create a New User and Assign It to a Group Using AWS IAM

        const S3User = new iam.User(this, 'S3User', {
            userName: 'S3User'
        });

        S3User.addToGroup(S3Group);

    }
}