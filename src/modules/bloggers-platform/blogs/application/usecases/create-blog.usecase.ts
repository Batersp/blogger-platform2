import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Blog } from '../../domain/blog.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

interface CreateBlogCommandProps {
  name: string;
  description: string;
  websiteUrl: string;
}

export class CreateBlogCommand extends Command<string> {
  name: string;
  description: string;
  websiteUrl: string;
  constructor(public init: CreateBlogCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
  CreateBlogCommand,
  string
> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<string> {
    const blog = Blog.createInstance(command);
    await this.blogsRepository.create(blog);
    return blog.id;
  }
}
