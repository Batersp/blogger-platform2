import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLike,
  PostLikeDocument,
  type PostLikeModelType,
} from '../domain/postLike.entity';

@Injectable()
export class PostLikesRepository {
  constructor(
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}
  async save(postLike: PostLikeDocument) {
    await postLike.save();
  }

  async findLike(
    postId: string,
    userId: string,
  ): Promise<PostLikeDocument | null> {
    return this.PostLikeModel.findOne({ postId, userId });
  }
}
