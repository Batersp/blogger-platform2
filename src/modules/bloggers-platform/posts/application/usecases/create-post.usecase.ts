import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { Post } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';

interface CreatePostCommandProps {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export class CreatePostCommand extends Command<string> {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  constructor(public init: CreatePostCommandProps) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<
  CreatePostCommand,
  string
> {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const blog = await this.blogsRepository.findOrNotFoundFail(command.blogId);
    const post = Post.createInstance(command, blog.name);
    await this.postsRepository.save(post);
    return post.id;
  }
}
