import bcrypt from "bcrypt";

import UserModel from "../modules/users/user.model.js";
import PostModel from "../modules/posts/post.model.js";
import CommentModel from "../modules/comments/comment.model.js";
import LikeModel from "../modules/likes/like.model.js";

export default async function seedDevelopmentData() {
  const password = await bcrypt.hash("Password123", 10);

  const primaryUser = UserModel.addUser(
    "Primary User",
    "primary@test.com",
    password,
  );

  const secondaryUser = UserModel.addUser(
    "Secondary User",
    "secondary@test.com",
    password,
  );

  const post1 = PostModel.createPost(
    primaryUser.id,
    "Primary user's first post",
    undefined,
  );

  const post2 = PostModel.createPost(
    primaryUser.id,
    "Primary user's second post",
    undefined,
  );

  const post3 = PostModel.createPost(
    secondaryUser.id,
    "Secondary user's post",
    undefined,
  );

  CommentModel.createComment(
    secondaryUser.id,
    post1.id,
    "Comment on first post",
  );

  CommentModel.createComment(
    primaryUser.id,
    post3.id,
    "Comment on secondary user's post",
  );

  LikeModel.addLike(secondaryUser.id, post1.id);
  LikeModel.addLike(primaryUser.id, post3.id);

  console.log("Development data seeded");
}