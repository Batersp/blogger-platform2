import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class DeletePostCommand extends Command<void> {
  constructor(
    public postId: string,
    public blogId: string,
  ) {
    super();
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<
  DeletePostCommand,
  void
> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ postId, blogId }: DeletePostCommand): Promise<void> {
    await this.blogsRepository.findOrNotFoundFail(blogId);
    const post = await this.postsRepository.findOrNotFoundFail(postId);
    post.makeDeleted();
    await this.postsRepository.save(post);
  }
}
