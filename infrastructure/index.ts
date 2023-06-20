import * as aws from "@pulumi/aws";

const tags = {
    'managed-by': "pulumi",
    project: 'farmers-market-finder'
}

const imageRepo = new aws.ecr.Repository("repo", {
    forceDelete: true,
    tags
})

export const imageRepoId = imageRepo.id;
export const imageRepoArn = imageRepo.arn;
export const imageRepoName = imageRepo.name;
export const imageRepoUrl = imageRepo.repositoryUrl;

const vpc = new aws.ec2.Vpc("vpc", {
    cidrBlock: "10.0.0.0/16",
    tags
  });


//   const example = new aws.apprunner.Service("example", {
//     serviceName: "example",
//     sourceConfiguration: {
//         authenticationConfiguration: {
//             connectionArn: aws_apprunner_connection.example.arn,
//         },
//         codeRepository: {
//             codeConfiguration: {
//                 codeConfigurationValues: {
//                     buildCommand: "python setup.py develop",
//                     port: "8000",
//                     runtime: "PYTHON_3",
//                     startCommand: "python runapp.py",
//                 },
//                 configurationSource: "API",
//             },
//             repositoryUrl: "https://github.com/example/my-example-python-app",
//             sourceCodeVersion: {
//                 type: "BRANCH",
//                 value: "main",
//             },
//         },
//     },
//     networkConfiguration: {
//         egressConfiguration: {
//             egressType: "VPC",
//             vpcConnectorArn: aws_apprunner_vpc_connector.connector.arn,
//         },
//     },
//     tags: {
//         Name: "example-apprunner-service",
//     },
// });
