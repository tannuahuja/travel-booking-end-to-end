variable "repository_name" { type = string }
variable "tags" { type = map(string) default = {} }

resource "aws_ecr_repository" "this" {
  name                 = var.repository_name
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration { scan_on_push = true }
  encryption_configuration { encryption_type = "AES256" }
  tags = var.tags
}

output "repository_url" { value = aws_ecr_repository.this.repository_url }
