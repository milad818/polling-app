#!/usr/bin/env bash
# Fetches secrets from SSM Parameter Store and writes .env for Docker Compose.
# Requires the EC2 instance to have the polling-app-ec2-role instance profile.
set -e

REGION="${AWS_REGION:-eu-central-1}"

get_param() {
    aws ssm get-parameter \
        --name "$1" \
        --with-decryption \
        --query Parameter.Value \
        --output text \
        --region "$REGION"
}

cat > ~/polling-app/.env << EOF
DB_PASSWORD=$(get_param /polling-app/DB_PASSWORD)
JWT_SECRET=$(get_param /polling-app/JWT_SECRET)

RDS_HOSTNAME=$(get_param /polling-app/RDS_HOSTNAME)
RDS_PORT=3306
RDS_DB_NAME=pollingappdb
RDS_USERNAME=admin
EOF

echo ".env written from SSM Parameter Store."
