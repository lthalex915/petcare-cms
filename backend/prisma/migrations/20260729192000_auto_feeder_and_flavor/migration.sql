-- AlterTable
ALTER TABLE "FeedingRecord" ADD COLUMN "flavor" TEXT;

-- CreateTable
CREATE TABLE "AutoFeederSetting" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "foodType" "FoodType" NOT NULL DEFAULT 'DRY',
  "foodBrand" TEXT,
  "flavor" TEXT,
  "amountGrams" DOUBLE PRECISION,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "updatedById" TEXT,

  CONSTRAINT "AutoFeederSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AutoFeederSetting"
  ADD CONSTRAINT "AutoFeederSetting_updatedById_fkey"
  FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
