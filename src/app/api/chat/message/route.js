import { prisma } from "@/lib/prisma";
import admin from "@/lib/firebase-admin";

export async function POST(request) {
  try {
    const { chatSessionId, message, sender } = await request.json();

    if (!chatSessionId || !message) {
      return Response.json(
        { success: false, error: "Chat session and message are required" },
        { status: 400 }
      );
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        chatSessionId: Number(chatSessionId),
        sender: sender || "USER",
        message,
      },
    });

    if (sender === "ADMIN") {
      try {
        const session = await prisma.chatSession.findUnique({
          where: {
            id: Number(chatSessionId),
          },
          include: {
            astrologer: true,
          },
        });

        if (session?.userId) {
          const tokens = await prisma.userPushToken.findMany({
            where: {
              userId: session.userId,
            },
          });

          for (const tokenRow of tokens) {
            try {
              await admin.messaging().send({
                token: tokenRow.token,
                notification: {
                  title: `New message from ${
                    session.astrologer?.name || "Astrologer"
                  }`,
                  body:
                    message.length > 100
                      ? message.slice(0, 100) + "..."
                      : message,
                },
                webpush: {
                  notification: {
                    icon: "/favicon.ico",
                    badge: "/favicon.ico",
                  },
                },
              });

              console.log(
                "PUSH_SENT",
                session.userId,
                tokenRow.token.substring(0, 20)
              );
            } catch (pushError) {
              console.error("PUSH_SEND_ERROR", pushError);
            }
          }
        }
      } catch (notificationError) {
        console.error("NOTIFICATION_ERROR", notificationError);
      }
    }

    return Response.json({
      success: true,
      message: chatMessage,
    });
  } catch (error) {
    console.error("SEND_MESSAGE_ERROR:", error);

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}