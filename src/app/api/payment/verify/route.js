import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const {
      userId,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let wallet = user.wallet;

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
        },
      });
    }

    const updatedWallet = await prisma.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: wallet.balance + Number(amount),
        transactions: {
          create: {
            amount: Number(amount),
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            status: "SUCCESS",
          },
        },
      },
      include: {
        transactions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      wallet: updatedWallet,
    });
  } catch (error) {
    console.error("VERIFY_PAYMENT_ERROR", error);

    return NextResponse.json(
      {
        error: "Payment verification failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}