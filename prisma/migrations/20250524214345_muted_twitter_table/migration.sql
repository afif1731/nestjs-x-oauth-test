-- CreateTable
CREATE TABLE "userTwitterMuted" (
    "id" TEXT NOT NULL,
    "blocked_user_id" TEXT NOT NULL,
    "blocked_username" TEXT NOT NULL,
    "blocked_tweet_id" TEXT NOT NULL,
    "is_hate_speech" BOOLEAN NOT NULL,
    "is_sexual_harassment" BOOLEAN NOT NULL,
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userTwitterMuted_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "userTwitterMuted" ADD CONSTRAINT "userTwitterMuted_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "userTwitterData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
