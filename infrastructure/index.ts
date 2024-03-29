// TODO consider setting up local docker to push the image to ECR

import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

const tags = {
  'managed-by': 'pulumi',
  project: 'farmers-market-finder',
};

const imageRepo = new aws.ecr.Repository('repo', {
  forceDelete: true,
  tags,
});

// vpc setup follows https://medium.com/appgambit/terraform-aws-vpc-with-private-public-subnets-with-nat-4094ad2ab331
// and the corresponding repository https://github.com/Prashant-jumpbyte/terraform-aws-vpc-setup/blob/master/modules/networking/main.tf
// also check out https://github.com/aws-samples/apprunner-hotel-app/blob/main/infra.yaml
const vpc = new aws.ec2.Vpc('vpc', {
  cidrBlock: '10.0.0.0/16',
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags,
});

const internetGateway = new aws.ec2.InternetGateway('ig', {
  vpcId: vpc.id,
  tags,
});

// Hopefully this is deterministic, because even within the us-east-1 region, some availability zones don't support App Runner. Creating the vpc connector fails with "The Availability Zones associated with the following subnet(s) don't support App Runner services"
const availabilityZones = aws.getAvailabilityZones({
  state: 'available',
});
const publicSubnet = new aws.ec2.Subnet('publicSubnet', {
  vpcId: vpc.id,
  cidrBlock: '10.0.1.0/24',
  mapPublicIpOnLaunch: true, // not sure if this is needed. Maybe for the NAT gateway?
  tags,
  availabilityZone: availabilityZones.then(
    (availabilityZones) => availabilityZones.names[0],
  ),
});

const natEip = new aws.ec2.Eip(
  'nat_eip',
  {
    vpc: true,
    tags,
  },
  {
    dependsOn: [internetGateway],
  },
);

const natGateway = new aws.ec2.NatGateway(
  'nat',
  {
    allocationId: natEip.id,
    subnetId: publicSubnet.id,
    tags,
  },
  {
    dependsOn: [internetGateway],
  },
);
const privateSubnet = new aws.ec2.Subnet('private-subnet', {
  vpcId: vpc.id,
  cidrBlock: '10.0.10.0/24',
  mapPublicIpOnLaunch: false,
  tags,
  availabilityZone: availabilityZones.then(
    (availabilityZones) => availabilityZones.names[0],
  ),
});
const privateSubnet2 = new aws.ec2.Subnet('private-subnet2', {
  vpcId: vpc.id,
  cidrBlock: '10.0.11.0/24',
  mapPublicIpOnLaunch: false,
  tags,
  availabilityZone: availabilityZones.then(
    (availabilityZones) => availabilityZones.names[1],
  ),
});

const privateSubnetRouteTable = new aws.ec2.RouteTable('private-subnet-rt', {
  vpcId: vpc.id,
  tags,
});
const privateSubnet2RouteTable = new aws.ec2.RouteTable('private-subnet2-rt', {
  vpcId: vpc.id,
  tags,
});
const publicSubnetRouteTable = new aws.ec2.RouteTable('public-subnet-rt', {
  vpcId: vpc.id,
  tags,
});

const publicInternetGatewayRoute = new aws.ec2.Route(
  'public_internet_gateway',
  {
    routeTableId: publicSubnetRouteTable.id,
    destinationCidrBlock: '0.0.0.0/0',
    gatewayId: internetGateway.id,
  },
);
const privateNatGatewayRoute = new aws.ec2.Route('private_nat_gateway', {
  routeTableId: privateSubnetRouteTable.id,
  destinationCidrBlock: '0.0.0.0/0',
  natGatewayId: natGateway.id,
});
const privateNatGatewayRoute2 = new aws.ec2.Route('private_nat_gateway2', {
  routeTableId: privateSubnet2RouteTable.id,
  destinationCidrBlock: '0.0.0.0/0',
  natGatewayId: natGateway.id,
});

const publicRouteTableAssociation = new aws.ec2.RouteTableAssociation(
  `public-rt-association`,
  {
    subnetId: publicSubnet.id,
    routeTableId: publicSubnetRouteTable.id,
  },
);
const privateRouteTableAssociation = new aws.ec2.RouteTableAssociation(
  `private-rt-association`,
  {
    subnetId: privateSubnet.id,
    routeTableId: privateSubnetRouteTable.id,
  },
);
const privateRouteTableAssociation2 = new aws.ec2.RouteTableAssociation(
  `private-rt-association2`,
  {
    subnetId: privateSubnet2.id,
    routeTableId: privateSubnet2RouteTable.id,
  },
);

const fmfServicePort = 3000;

const defaultSecGroup = new aws.ec2.SecurityGroup('secGroup', {
  vpcId: vpc.id,
  description: 'Default security group to allow inbound/outbound from the VPC',
  ingress: [
    {
      protocol: '-1',
      fromPort: 0,
      toPort: 0,
      self: true,
    },
  ],
  egress: [
    {
      fromPort: 0,
      toPort: 0,
      protocol: '-1',
      self: true,
    },
  ],
  tags,
});

const rdsSubnetGroup = new aws.rds.SubnetGroup('rds-subnet-group', {
  subnetIds: [privateSubnet.id, privateSubnet2.id], // needs at least 2 AZs
  tags,
});
// const rdsPassword = aws.secretsmanager.getRandomPasswordOutput({
//   passwordLength: 46,
// });
const rdsUsername = 'postgres';
// const rdsPasswordSecret = new aws.secretsmanager.Secret('rds-password-secret', {
//   tags,
// });
// const rdsPasswordSecretVersion = new aws.secretsmanager.SecretVersion(
//   'rds-password-secret-version',
//   {
//     secretId: rdsPasswordSecret.id,
//     secretString: rdsPassword.apply((pw) =>
//       // this will create a Key-Value pair
//       JSON.stringify({
//         password: pw.randomPassword,
//         username: rdsUsername,
//       }),
//     ),
//   },
//   {
//     ignoreChanges: ['secretString'],
//   },
// );
const rdsInstance = new aws.rds.Instance('rds-instance', {
  skipFinalSnapshot: true, // TODO: this should be false in production
  allocatedStorage: 5,
  engine: 'postgres',
  engineVersion: '14.8',
  instanceClass: 'db.t4g.micro',
  name: 'fmfDb',
  dbSubnetGroupName: rdsSubnetGroup.name,
  vpcSecurityGroupIds: [defaultSecGroup.id], // FIXME: this should be a security group that only allows connections from the app runner service
  manageMasterUserPassword: true,
  username: rdsUsername,
  // password: rdsPassword.apply((pw) => pw.randomPassword),
});

// ##########################################################################
// App Runner
// ##########################################################################

const vpcConnector = new aws.apprunner.VpcConnector('connector', {
  securityGroups: [defaultSecGroup.id],
  subnets: [privateSubnet.id, privateSubnet2.id], // only providing private subnet because of warning in AppRunner event log: 06-20-2023 10:28:55 PM [AppRunner] Provide private subnet ids for VPC connector to avoid connection failures when accessing the internet. Public subnet ids provided in this request, SubnetIDs: [subnet-00bd8d3654c33adaf]
  vpcConnectorName: 'connector-nestjs-to-vpc',
  tags,
});

// https://www.pulumi.com/blog/deploy-applications-with-aws-app-runner/
const ecrAccessRole = new aws.iam.Role('ecr-access-role', {
  assumeRolePolicy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'sts:AssumeRole',
        Principal: {
          Service: 'build.apprunner.amazonaws.com',
        },
        Effect: 'Allow',
      },
    ],
  }),
  tags,
});
// WORKAROUND: not using Role.inlinePolicies since it didn't get created or not tracked by pulumi state. dont know why. Instead going for a RolePolicyAttachment
const ecrAccessRolePolicy = new aws.iam.Policy('ecr-access-policy', {
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: [
          'ecr:GetAuthorizationToken',
          'ecr:BatchCheckLayerAvailability',
          'ecr:GetDownloadUrlForLayer',
          'ecr:BatchGetImage',
          'ecr:DescribeImages',
        ],
        Sid: 'EcrAccess',
        Effect: 'Allow',
        Resource: ['*'],
      },
    ],
  },
});
const ecrAccessRolePolicyAttachment = new aws.iam.RolePolicyAttachment(
  'role-policy-attachment',
  {
    policyArn: ecrAccessRolePolicy.arn,
    role: ecrAccessRole.name,
  },
);

const instanceRole = new aws.iam.Role('instance-role', {
  // https://repost.aws/it/questions/QUhtLYW1B2T_SuGWSlDJVs3Q/guide-to-creating-an-instance-role-that-will-allow-my-app-runner-service-to-use-values-from-ssm-parameter-store
  assumeRolePolicy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'sts:AssumeRole',
        Principal: {
          Service: 'tasks.apprunner.amazonaws.com',
        },
        Effect: 'Allow',
      },
    ],
  }),
  tags,
});

const currentAwsIdentity = aws.getCallerIdentity({});

// next step, use https://aws.amazon.com/blogs/aws/new-for-app-runner-vpc-support/ to connect to DB
// preparation for environment secrets.
const instanceRolePolicy = new aws.iam.Policy('instance-role-policy', {
  policy: {
    // copied from the app runner console -> create service -> .. continue -> IAM policy templates -> SSM Parameter Store
    Statement: [
      {
        Action: ['secretsmanager:GetSecretValue', 'kms:Decrypt*'],
        Effect: 'Allow',
        Resource: rdsInstance.masterUserSecrets.apply((secrets) =>
          secrets.map((s) => [s.secretArn, s.kmsKeyId]).flat(),
        ),
      },
      {
        Effect: 'Allow',
        Action: ['rds-db:connect'],
        Resource: pulumi
          .all([currentAwsIdentity, rdsInstance.id])
          .apply(
            ([awsIdentity, rdsId]) =>
              `arn:aws:rds-db:${awsIdentity.accountId}:dbuser:${rdsId}/${rdsUsername}`,
          ),
      },
    ],
    Version: '2012-10-17',
  },
});
const instanceRolePolicyAttachment = new aws.iam.RolePolicyAttachment(
  'instance-role-policy-attachment',
  {
    policyArn: instanceRolePolicy.arn,
    role: instanceRole.name,
  },
);

//   https://www.pulumi.com/registry/packages/aws/api-docs/apprunner/service/#servicesourceconfiguration
const fmfService = new aws.apprunner.Service(
  'fmf-service',
  {
    serviceName: 'farmers-market-finder',
    healthCheckConfiguration: {
      protocol: 'HTTP',
      path: '/health',
    },
    sourceConfiguration: {
      // autoDeploymentsEnabled: false, // we want to start deployments from CICD with a step in between. Or maybe not?
      authenticationConfiguration: {
        accessRoleArn: ecrAccessRole.arn,
      },
      imageRepository: {
        imageRepositoryType: 'ECR',
        imageIdentifier: pulumi.interpolate`${imageRepo.repositoryUrl}:latest`,
        imageConfiguration: {
          port: fmfServicePort.toString(),
          runtimeEnvironmentSecrets: {
            // POSTGRES_USER: rdsInstance.username,
            POSTGRES_CREDENTIALS_JSON: rdsInstance.masterUserSecrets.apply(
              (secrets) => `${secrets[0].secretArn}`, // pulumi quirk: need backticks to convert it to a string
            ),
          },
          runtimeEnvironmentVariables: {
            NODE_ENV: 'production',
            FMF_PORT: fmfServicePort.toString(),
            NO_COLOR: 'enabled', // can be any non-empty value. see https://docs.nestjs.com/techniques/logger#:~:text=To%20disable%20color%20in%20the%20default%20logger%27s%20messages%2C%20set%20the%20NO_COLOR%20environment%20variable%20to%20some%20non%2Dempty%20string.
            POSTGRES_HOST: rdsInstance.endpoint.apply((e) => e.split(':')[0]), // remove the port from the endpoint
            POSTGRES_PORT: rdsInstance.port.apply((p) => p.toString()),
            POSTGRES_DB: rdsInstance.dbName, // how to get the db name https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ConnectToPostgreSQLInstance.html
          },
        },
      },
    },
    networkConfiguration: {
      egressConfiguration: {
        egressType: 'VPC',
        vpcConnectorArn: vpcConnector.arn,
      },
    },
    instanceConfiguration: {
      cpu: '0.25 vCPU',
      memory: '0.5 GB',
      instanceRoleArn: instanceRole.arn,
    },
    //   autoScalingConfigurationArn: fmfAutoScalingConfig.arn,
    tags,
  },
  {
    dependsOn: [
      ecrAccessRolePolicyAttachment,
      natGateway,
      privateRouteTableAssociation,
      privateRouteTableAssociation2,
      publicRouteTableAssociation,
      publicInternetGatewayRoute,
      privateNatGatewayRoute,
      privateNatGatewayRoute2,
      instanceRolePolicyAttachment,
    ],
    deleteBeforeReplace: true,
  },
);

// https://www.pulumi.com/registry/packages/aws/api-docs/apprunner/autoscalingconfigurationversion/
// const fmfAutoScalingConfig = new aws.apprunner.AutoScalingConfigurationVersion(
//   'fmf-autoscaling-config',
//   {
//     autoScalingConfigurationName: 'fmf-autoscaling-config',
//     maxConcurrency: 50,
//     maxSize: 10,
//     minSize: 1,
//     tags,
//   },
// );

// ##########################################################################
// exports
// ##########################################################################

export const imageRepoId = imageRepo.id;
export const imageRepoArn = imageRepo.arn;
export const imageRepoName = imageRepo.name;
export const imageRepoUrl = imageRepo.repositoryUrl;
export const ecrAccessRoleArn = ecrAccessRole.arn;
export const instanceRolePolicyArn = instanceRolePolicy.arn;

export const fmfServiceUrl = fmfService.serviceUrl;
export const fmfServiceArn = fmfService.arn;

export const dbSecretArn = rdsInstance.masterUserSecrets.apply(
  (s) => s[0].secretArn,
);
