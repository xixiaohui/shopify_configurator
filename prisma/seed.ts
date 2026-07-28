import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.productVariant.deleteMany();
  await prisma.productOptionValue.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.product.deleteMany();

  // Create product
  const product = await prisma.product.create({
    data: {
      title: "Custom Product",
      description: "A configurable product for testing the Product Configurator API",
      basePrice: 199,
    },
  });

  console.log(`Created product: ${product.title} (id: ${product.id})`);

  // Create options
  const colorOption = await prisma.productOption.create({
    data: {
      productId: product.id,
      name: "Color",
    },
  });

  const sizeOption = await prisma.productOption.create({
    data: {
      productId: product.id,
      name: "Size",
    },
  });

  // Create option values for Color
  const blackValue = await prisma.productOptionValue.create({
    data: {
      optionId: colorOption.id,
      value: "Black",
      extraPrice: 0,
    },
  });

  const whiteValue = await prisma.productOptionValue.create({
    data: {
      optionId: colorOption.id,
      value: "White",
      extraPrice: 10,
    },
  });

  // Create option values for Size
  const mValue = await prisma.productOptionValue.create({
    data: {
      optionId: sizeOption.id,
      value: "M",
      extraPrice: 0,
    },
  });

  const lValue = await prisma.productOptionValue.create({
    data: {
      optionId: sizeOption.id,
      value: "L",
      extraPrice: 20,
    },
  });

  console.log("Created option values");

  // Create variants
  const variants = [
    { combination: { Color: "Black", Size: "M" }, sku: "SKU-BLK-M", price: 199 },
    { combination: { Color: "Black", Size: "L" }, sku: "SKU-BLK-L", price: 219 },
    { combination: { Color: "White", Size: "M" }, sku: "SKU-WHT-M", price: 209 },
    { combination: { Color: "White", Size: "L" }, sku: "SKU-WHT-L", price: 229 },
  ];

  for (const v of variants) {
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: v.sku,
        price: v.price,
        stock: 50,
        optionCombination: v.combination,
      },
    });
    console.log(`Created variant: ${v.sku}`);
  }

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
