import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class DeleteBlogCommand extends Command<void> {
  constructor(public blogId: string) {
    super();
  }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<
  DeleteBlogCommand,
  void
> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ blogId }: DeleteBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail(blogId);
    blog.makeDeleted();
    await this.blogsRepository.save(blog);
  }
}
