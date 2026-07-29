import { Prisma, PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

function modelHasField(modelName: string, fieldName: string): boolean {
  const model = Prisma.dmmf.datamodel.models.find((item) => item.name === modelName);
  return Boolean(model?.fields.some((field) => field.name === fieldName));
}

export interface PrismaFeatures {
  autoFeederTable: boolean;
  feedingFlavor: boolean;
  autoFeederFlavor: boolean;
  feedingGramsField: "foodGrams" | "dryFoodGrams";
}

let featurePromise: Promise<PrismaFeatures> | null = null;

async function hasColumn(tableName: string, columnName: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${tableName}
        AND column_name = ${columnName}
    ) AS "exists"
  `;
  return Boolean(rows[0]?.exists);
}

async function hasTable(tableName: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ${tableName}
    ) AS "exists"
  `;
  return Boolean(rows[0]?.exists);
}

export function getPrismaFeatures(): Promise<PrismaFeatures> {
  if (!featurePromise) {
    featurePromise = (async () => {
      const modelFeedingFlavor = modelHasField("FeedingRecord", "flavor");
      const modelAutoFeederFlavor = modelHasField("AutoFeederSetting", "flavor");
      const modelFoodGrams = modelHasField("FeedingRecord", "foodGrams");
      const modelDryFoodGrams = modelHasField("FeedingRecord", "dryFoodGrams");
      const feedingGramsField: "foodGrams" | "dryFoodGrams" = modelFoodGrams ? "foodGrams" : "dryFoodGrams";

      try {
        const [dbFeedingTable, dbAutoFeederTable] = await Promise.all([
          hasTable("FeedingRecord"),
          hasTable("AutoFeederSetting")
        ]);

        const [dbFeedingFlavor, dbAutoFeederFlavor] = await Promise.all([
          dbFeedingTable ? hasColumn("FeedingRecord", "flavor") : Promise.resolve(false),
          dbAutoFeederTable ? hasColumn("AutoFeederSetting", "flavor") : Promise.resolve(false)
        ]);

        return {
          autoFeederTable: dbAutoFeederTable,
          feedingFlavor: modelFeedingFlavor && dbFeedingFlavor,
          autoFeederFlavor: modelAutoFeederFlavor && dbAutoFeederFlavor,
          feedingGramsField
        };
      } catch {
        return {
          autoFeederTable: false,
          feedingFlavor: false,
          autoFeederFlavor: false,
          feedingGramsField: modelDryFoodGrams ? "dryFoodGrams" : feedingGramsField
        };
      }
    })();
  }

  return featurePromise;
}
