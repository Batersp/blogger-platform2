import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { LIKE_STATUS } from '../../../../../core/enums/likeStatus.enum';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { Post } from '../../domain/post.entity';
import { PostLike } from '../../domain/postLike.entity';

type NewestLike = {
  addedAt: Date;
  userId: string;
  login: string;
};

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post)
    private postsRepo: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikesRepo: Repository<PostLike>,
  ) {}

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<PostViewDto> {
    const post = await this.postsRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('post not found');

    let myStatus = LIKE_STATUS.NONE;
    if (userId) {
      const like = await this.postLikesRepo.findOne({
        where: { postId: id, userId },
      });
      if (like) myStatus = like.likeStatus;
    }

    const newestLikesRows = await this.postLikesRepo.find({
      where: { postId: id, likeStatus: LIKE_STATUS.LIKE },
      order: { createdAt: 'DESC' },
      take: 3,
    });

    const newestLikes: NewestLike[] = newestLikesRows.map((row) => ({
      addedAt: row.createdAt,
      userId: row.userId,
      login: row.userLogin,
    }));

    return PostViewDto.mapToView(post, myStatus, newestLikes);
  }

  async getAll(
    query: GetPostsQueryParams,
    blogId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const qb = this.postsRepo.createQueryBuilder('p');

    if (blogId) {
      qb.andWhere('p.blogId = :blogId', { blogId });
    }

    const stringColumns = ['title', 'shortDescription', 'content', 'blogName'];
    if (stringColumns.includes(query.sortBy)) {
      qb.orderBy(
        `p.${query.sortBy} COLLATE "C"`,
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      qb.orderBy(
        `p.${query.sortBy}`,
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    qb.skip(query.calculateSkip()).take(query.pageSize);

    const [posts, totalCount] = await qb.getManyAndCount();

    let likesMap = new Map<string, LIKE_STATUS>();
    const newestLikesMap = new Map<string, NewestLike[]>();

    if (posts.length > 0) {
      const postIds = posts.map((p) => p.id);

      if (userId) {
        const likes = await this.postLikesRepo.find({
          where: { postId: In(postIds), userId },
        });
        likesMap = new Map(likes.map((l) => [l.postId, l.likeStatus]));
      }

      const allLikeRows = await this.postLikesRepo.find({
        where: { postId: In(postIds), likeStatus: LIKE_STATUS.LIKE },
        order: { postId: 'ASC', createdAt: 'DESC' },
      });

      for (const row of allLikeRows) {
        const existing = newestLikesMap.get(row.postId) ?? [];
        if (existing.length < 3) {
          existing.push({
            addedAt: row.createdAt,
            userId: row.userId,
            login: row.userLogin,
          });
          newestLikesMap.set(row.postId, existing);
        }
      }
    }

    return PaginatedViewDto.mapToView({
      items: posts.map((post) =>
        PostViewDto.mapToView(
          post,
          likesMap.get(post.id) ?? LIKE_STATUS.NONE,
          newestLikesMap.get(post.id) ?? [],
        ),
      ),
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
