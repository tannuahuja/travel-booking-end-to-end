provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "travel-booking"
      Environment = "prod"
      ManagedBy   = "Terraform"
    }
  }
}

module "frontend_ecr" {
  source          = "../../modules/ecr"
  repository_name = var.frontend_repository
  tags = { Component = "frontend" }
}

module "backend_ecr" {
  source          = "../../modules/ecr"
  repository_name = var.backend_repository
  tags = { Component = "backend" }
}

output "frontend_ecr_url" { value = module.frontend_ecr.repository_url }
output "backend_ecr_url" { value = module.backend_ecr.repository_url }
