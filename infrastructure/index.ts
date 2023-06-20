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


// const vpc = new aws.ec2.Vpc("vpc", {
//     cidrBlock: "10.0.0.0/16",
//     tags
//   });