# Terraform notes

This starter deliberately begins with ECR repositories only. It avoids automatically creating VPC/EKS/EC2 resources in restricted lab accounts. Add VPC and EKS modules only after verifying allowed actions, approved instance types, EBS volume-size restrictions, IAM permissions and cost.

For a real team, configure a remote S3 backend with locking supported by your chosen Terraform version and AWS design; use separate state keys for dev and prod. Do not configure a remote backend until the bucket, encryption, access policy and locking approach are ready. Example initialization for this local-state starter:

```bash
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform show tfplan
```

Run each environment from its own directory. Never apply dev variables to prod. The `.tfvars` files in this repository are examples, not live credentials.
