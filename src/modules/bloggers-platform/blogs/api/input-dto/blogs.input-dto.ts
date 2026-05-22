export class CreateBlogInputDTO {
  name: string;
  description: string;
  websiteUrl: string;
}

export class UpdateBlogInputDTO {
  name: string;
  description: string;
  websiteUrl: string;
}

export class CreatePostForBlogInputDto {
  title: string;
  shortDescription: string;
  content: string;
}
