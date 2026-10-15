import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getData } from "@/lib/data";
import { validDate } from "@/lib/rules";
import { allowedOrigin } from "@/lib/origin";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json(await getData());
}
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!allowedOrigin(origin, req.headers.get("host"), req.url))
    return NextResponse.json(
      {
        error:
          "页面地址与服务地址不一致，请从 http://127.0.0.1:3000 重新打开后再试。",
      },
      { status: 403 },
    );
  try {
    const body = await req.json();
    const { action } = body;
    if (action === "profile") {
      if (
        typeof body.nickname !== "string" ||
        !body.nickname.trim() ||
        body.nickname.trim().length > 24 ||
        typeof body.bio !== "string" ||
        body.bio.length > 160 ||
        !["compass", "mountain", "stars", "sprout"].includes(body.avatar)
      )
        throw Error("请检查昵称、简介和头像");
      const profile = {
        nickname: body.nickname.trim(),
        bio: body.bio.trim(),
        avatar: body.avatar,
      };
      await db.user.upsert({
        where: { id: "local" },
        create: { id: "local", ...profile },
        update: profile,
      });
    } else {
      if (!(await db.user.findUnique({ where: { id: "local" } })))
        throw Error("请先创建探险家档案");
      if (action === "unlock") {
        if (
          !validDate(body.date) ||
          typeof body.note !== "string" ||
          body.note.length > 500
        )
          throw Error(
            "请填写有效的完成日期（不能晚于今天）和最多 500 字的经历",
          );
        if (
          typeof body.id !== "string" ||
          !(await db.achievement.findUnique({ where: { id: body.id } }))
        )
          throw Error("成就不存在");
        await db.userAchievement.upsert({
          where: {
            userId_achievementId: { userId: "local", achievementId: body.id },
          },
          create: {
            userId: "local",
            achievementId: body.id,
            completedAt: body.date,
            note: body.note.trim(),
          },
          update: {},
        });
      } else if (action === "revoke") {
        if (typeof body.id !== "string") throw Error("成就不存在");
        await db.$transaction([
          db.showcase.deleteMany({
            where: { userId: "local", achievementId: body.id },
          }),
          db.userAchievement.deleteMany({
            where: { userId: "local", achievementId: body.id },
          }),
        ]);
      } else if (action === "showcase") {
        if (
          !Array.isArray(body.ids) ||
          body.ids.length > 6 ||
          body.ids.some((id: unknown) => typeof id !== "string") ||
          new Set(body.ids).size !== body.ids.length
        )
          throw Error("最多展示 6 个不同的成就");
        await db.$transaction(async (tx) => {
          const count = await tx.userAchievement.count({
            where: { userId: "local", achievementId: { in: body.ids } },
          });
          if (count !== body.ids.length) throw Error("只能展示已解锁成就");
          await tx.showcase.deleteMany({ where: { userId: "local" } });
          for (const [position, achievementId] of body.ids.entries())
            await tx.showcase.create({
              data: { userId: "local", achievementId, position },
            });
        });
      } else throw Error("未知操作");
    }
    return NextResponse.json(await getData());
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "保存失败，请重试" },
      { status: 400 },
    );
  }
}
