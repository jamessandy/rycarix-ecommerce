import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const productId = resolvedParams.id;

    await prisma.$transaction(async (tx) => {
      // Remove any wishlist references first
      await tx.wishlistItem.deleteMany({
        where: { productId },
      });

      // Detach from historical order items so order records stay intact
      await tx.orderItem.updateMany({
        where: { productId },
        data: { productId: null },
      });

      // Delete the product
      await tx.product.delete({
        where: { id: productId },
      });
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      action: "deleted",
      message: "Product permanently deleted.",
    });
  } catch (error: any) {
    console.error("Product deletion error, falling back to soft archive:", error);

    // Fallback: If an external constraint blocks deletion, mark out-of-stock & hidden
    try {
      const resolvedParams = await Promise.resolve(params);
      await prisma.product.update({
        where: { id: resolvedParams.id },
        data: { isLive: false, stock: 0 },
      });

      revalidatePath("/admin/products");
      revalidatePath("/shop");

      return NextResponse.json({
        success: true,
        action: "archived",
        message: "Product archived and removed from storefront.",
      });
    } catch (archiveError) {
      return NextResponse.json(
        { error: "Unable to delete or archive product." },
        { status: 500 }
      );
    }
  }
}
