# Infrastructure for Farmers Market Finder

```sh
# from infrastructure/ directory
TAG_SUFFIX=latest
TAG_REPO=farmers-market-finder
ECR_REGISTRY_BASE=756399734264.dkr.ecr.us-east-1.amazonaws.com
ECR_REPOSITORY_SUFFIX=repo-75a8bf3

docker build -t $TAG_REPO:$TAG_SUFFIX ..

# test the build
docker run --rm -p 3001:3333 -e FMF_PORT='3333' -e POSTGRES_HOST='172.17.0.1' -e POSTGRES_PORT=5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=test --name nestjs-fargate-test $TAG_REPO:$TAG_SUFFIX
google-chrome --profile-directory=Default http://localhost:3001

# login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY_BASE

# tag the image for ECR
TAG_ID=$(docker images -q $TAG_REPO:$TAG_SUFFIX)
docker tag $TAG_ID $ECR_REGISTRY_BASE/$ECR_REPOSITORY_SUFFIX:$TAG_SUFFIX

# push the image to ECR
docker push $ECR_REGISTRY_BASE/$ECR_REPOSITORY_SUFFIX:$TAG_SUFFIX
```

## Trigger a deployment manually

```sh
# if the service is not running, start it
aws apprunner resume-service --service-arn ...

# trigger a deployment
aws apprunner start-deployment --service-arn ...
```
