import { DataAwsIamPolicyDocument } from '@cdktf/provider-aws/lib/data-aws-iam-policy-document';
import { DynamodbTable } from '@cdktf/provider-aws/lib/dynamodb-table';
import { ElasticBeanstalkApplication } from '@cdktf/provider-aws/lib/elastic-beanstalk-application';
import { ElasticBeanstalkEnvironment } from '@cdktf/provider-aws/lib/elastic-beanstalk-environment';
import { IamInstanceProfile } from '@cdktf/provider-aws/lib/iam-instance-profile';
import { IamPolicy } from '@cdktf/provider-aws/lib/iam-policy';
import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { IamRolePolicyAttachment } from '@cdktf/provider-aws/lib/iam-role-policy-attachment';
import { IamUser } from '@cdktf/provider-aws/lib/iam-user';
import { IamUserPolicyAttachment } from '@cdktf/provider-aws/lib/iam-user-policy-attachment';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { TerraformOutput, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';

interface ProjectStackProps {
  environmentName: string;
  region: string;
}

export class ProjectStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: ProjectStackProps) {
    super(scope, id);

    const { environmentName, region } = props;

    new AwsProvider(this, 'aws', {
      region,
    });

    const dynamodbTable = new DynamodbTable(this, 'users_table', {
      name: `${environmentName}-users`,
      hashKey: 'id',
      attribute: [
        {
          name: 'id',
          type: 'S',
        },
        {
          name: 'email',
          type: 'S',
        },
      ],
      billingMode: 'PAY_PER_REQUEST',
      globalSecondaryIndex: [
        {
          name: 'email_index',
          hashKey: 'email',
          projectionType: 'ALL',
        },
      ],
    });

    /**
     * Application Permissions
     */

    const trustedPolicyDocument = new DataAwsIamPolicyDocument(
      this,
      'trusted_policy_document',
      {
        statement: [
          {
            effect: 'Allow',
            actions: ['sts:AssumeRole'],
            principals: [
              {
                type: 'Service',
                identifiers: ['ec2.amazonaws.com'],
              },
            ],
          },
        ],
      },
    );

    const permissionsPolicyDocument = new DataAwsIamPolicyDocument(
      this,
      'permissions_policy_document',
      {
        statement: [
          {
            effect: 'Allow',
            actions: ['dynamodb:*'],
            resources: [`${dynamodbTable.arn}*`],
          },
        ],
      },
    );

    const iamPolicy = new IamPolicy(this, 'iam_policy', {
      name: `${environmentName}_application_policy`,
      policy: permissionsPolicyDocument.json,
    });

    const iamRole = new IamRole(this, 'iam_role', {
      assumeRolePolicy: trustedPolicyDocument.json,
      name: `${environmentName}_application_role`,
    });

    new IamRolePolicyAttachment(this, 'iam_role_policy_attachment', {
      policyArn: iamPolicy.arn,
      role: iamRole.name,
    });

    const managedPolicies = [
      'arn:aws:iam::aws:policy/AdministratorAccess-AWSElasticBeanstalk',
      'arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker',
      'arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier',
      'arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier',
      'arn:aws:iam::aws:policy/AmazonEC2FullAccess',
    ];

    managedPolicies.forEach((policyArn, index) => {
      new IamRolePolicyAttachment(this, `role-policy-attachment-${index}`, {
        role: iamRole.name,
        policyArn: policyArn,
      });
    });

    /**
     * Application Elastic Beanstalk
     */

    const application = new ElasticBeanstalkApplication(this, 'application', {
      description: 'api-rest-do-zero-a-aws-com-terraform',
      name: `${environmentName}-api-rest-do-zero-a-aws-com-terraform`,
      appversionLifecycle: {
        serviceRole: iamRole.arn,
        deleteSourceFromS3: true,
      },
    });

    const instanceProfile = new IamInstanceProfile(this, 'instance_profile', {
      name: 'aws-elasticbeanstalk-ec2-role',
      role: iamRole.name,
    });

    const environment = new ElasticBeanstalkEnvironment(this, 'environment', {
      tier: 'WebServer',
      application: application.name,
      name: `${environmentName}-api-rest-do-zero-a-aws-com-terraform`,
      solutionStackName: '64bit Amazon Linux 2023 v6.2.0 running Node.js 20',
      tags: {
        Name: 'api-rest-do-zero-a-aws-com-terraform',
        Environment: environmentName,
      },
      setting: [
        {
          namespace: 'aws:autoscaling:launchconfiguration',
          name: 'IamInstanceProfile',
          value: instanceProfile.name,
        },
        {
          namespace: 'aws:elasticbeanstalk:cloudwatch:logs',
          name: 'StreamLogs',
          value: 'true',
        },
        {
          namespace: 'aws:elasticbeanstalk:cloudwatch:logs',
          name: 'RetentionInDays',
          value: '7',
        },
        {
          namespace: 'aws:elasticbeanstalk:cloudwatch:logs',
          name: 'DeleteOnTerminate',
          value: 'false',
        },
        {
          namespace: 'aws:elasticbeanstalk:application:environment',
          name: 'ENVIRONMENT',
          value: environmentName,
        },
        {
          namespace: 'aws:elasticbeanstalk:application:environment',
          name: 'NO_COLOR',
          value: 'true',
        },
        {
          namespace: 'aws:elasticbeanstalk:application:environment',
          name: 'AWS_REGION',
          value: region,
        },
      ],
    });

    new TerraformOutput(this, 'environment_url', {
      value: environment.endpointUrl,
    });

    /**
     * Github Actions User and Permissions
     */

    const githubActionsUser = new IamUser(this, 'github_actions_user', {
      name: `${environmentName}-github-actions`,
    });

    const githubActionsPolicyDocument = new DataAwsIamPolicyDocument(
      this,
      'github_actions_policy_document',
      {
        statement: [
          {
            effect: 'Allow',
            actions: ['*'],
            resources: ['*'],
          },
        ],
      },
    );

    const iamPolicyGithubActions = new IamPolicy(
      this,
      'iam_policy_github_actions',
      {
        name: `${environmentName}_github_actions_policy`,
        policy: githubActionsPolicyDocument.json,
      },
    );

    new IamUserPolicyAttachment(
      this,
      'iam_role_policy_attachment_github_actions',
      {
        policyArn: iamPolicyGithubActions.arn,
        user: githubActionsUser.name,
      },
    );
  }
}
