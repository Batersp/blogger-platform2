import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

interface UpdateBlogCommandProps {
  name: string;
  description: string;
  websiteUrl: string;
  blogId: string;
}

export class UpdateBlogCommand extends Command<void> {
  name: string;
  description: string;
  websiteUrl: string;
  blogId: string;
  constructor(public init: UpdateBlogCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<
  UpdateBlogCommand,
  void
> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail(command.blogId);
    blog.update({
      name: command.name,
      description: command.description,
      websiteUrl: command.websiteUrl,
    });
    await this.blogsRepository.save(blog);
  }
}
