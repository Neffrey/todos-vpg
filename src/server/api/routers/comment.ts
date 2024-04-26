import "server-only"; // Make sure you can't import this on client

// LIBS
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// UTILS
import { createTRPCRouter, userProcedure } from "~/server/api/trpc";
import { comments } from "~/server/db/schema";

export const commentRouter = createTRPCRouter({
  getAllWhereTaskId: userProcedure
    .input(
      z.object({
        taskId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.query.comments.findMany({
        where: eq(comments.taskId, input.taskId),
      });
    }),
  create: userProcedure
    .input(
      z.object({
        taskId: z.string().min(1),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(comments).values({
        taskId: input.taskId,
        content: input.content,
        userId: ctx.session.user.id,
      });

      return await ctx.db.query.comments.findMany({
        where: eq(comments.taskId, input.taskId),
      });
    }),
  delete: userProcedure
    .input(
      z.object({
        taskId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .delete(comments)
        .where(
          and(
            eq(comments.taskId, input.taskId),
            eq(comments.userId, ctx.session.user.id),
          ),
        );
    }),
  edit: userProcedure
    .input(
      z.object({
        taskId: z.string().min(1),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .update(comments)
        .set({
          content: input.content,
        })
        .where(
          and(
            eq(comments.taskId, input.taskId),
            eq(comments.userId, ctx.session.user.id),
          ),
        );
    }),
});
