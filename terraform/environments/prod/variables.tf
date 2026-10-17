variable "aws_region" {
  type        = string
  description = "AWS region for this environment"
  default     = "us-east-1"
}
variable "frontend_repository" { type = string }
variable "backend_repository" { type = string }
