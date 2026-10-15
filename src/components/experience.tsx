"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Trophy,
  Search,
  Check,
  Lock,
  Compass,
  LayoutGrid,
  UserRound,
  Settings2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Plus,
} from "lucide-react";
import type { AppData, Achievement } from "@/lib/data";
import { categories } from "@/lib/catalog";
import Badge from "./badge";
import Modal from "./modal";
const ranks = ["普通", "稀有", "极其稀有", "史诗", "传说"];
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export default function Experience({
  initial,
  page,
}: {
  initial: AppData;
  page: string;
}) {
  const [data, setData] = useState(initial),
    [selected, setSelected] = useState<Achievement | null>(null),
    [mode, setMode] = useState<"detail" | "unlock" | "revoke">("detail"),
    [profile, setProfile] = useState(false),
    [showcase, setShowcase] = useState(false),
    [picked, setPicked] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState<Achievement | null>(null);
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState(-1),
    [status, setStatus] = useState("all"),
    [rarity, setRarity] = useState("all"),
    [sort, setSort] = useState("default");
  const user = data.user,
    unlocks = user?.unlocks ?? [],
    total = data.achievements.length,
    percent = total ? Math.round((unlocks.length / total) * 100) : 0;
  const unlocked = new Map(unlocks.map((u) => [u.achievementId, u]));
  const recent = [...unlocks]
    .sort(
      (a, b) =>
        b.completedAt.localeCompare(a.completedAt) ||
        b.createdAt.localeCompare(a.createdAt),
    )
    .map((u) => data.achievements.find((a) => a.id === u.achievementId)!);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);
  async function save(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "保存失败");
      setData(result);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "网络异常，请重试");
      return false;
    } finally {
      setBusy(false);
    }
  }
  function open(a: Achievement) {
    setSelected(a);
    setMode("detail");
    setError("");
  }
  const visible = useMemo(() => {
    const ids = new Set(data.user?.unlocks.map((u) => u.achievementId));
    return data.achievements
      .filter(
        (a) =>
          (category < 0 || a.category === category) &&
          (status === "all" ||
            (status === "unlocked" ? ids.has(a.id) : !ids.has(a.id))) &&
          (rarity === "all" || a.label === rarity) &&
          `${a.name}${a.description}`
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
      )
      .sort((a, b) =>
        sort === "rate"
          ? (b.rate ?? -1) - (a.rate ?? -1)
          : sort === "rare"
            ? b.rank - a.rank
            : sort === "difficulty"
              ? b.difficulty - a.difficulty
              : a.id.localeCompare(b.id),
      );
  }, [data, category, status, rarity, query, sort]);
  function cards(items: Achievement[]) {
    return (
      <div className="achievement-grid">
        {items.map((a) => {
          const record = unlocked.get(a.id);
          return (
            <button
              key={a.id}
              onClick={() => open(a)}
              className={`achievement-card ${record ? "is-unlocked" : ""} rarity-${a.rank}`}
            >
              <div className="card-top">
                <Badge icon={a.icon} category={a.category} locked={!record} />
                <span className={`state-pill ${record ? "done" : ""}`}>
                  {record ? <Check size={12} /> : <Lock size={11} />}{" "}
                  {record ? "已解锁" : "待探索"}
                </span>
              </div>
              <div className="card-category">
                {categories[a.category]}{" "}
                <span>
                  · {["", "入门", "进阶", "挑战", "卓越", "极限"][a.difficulty]}
                </span>
              </div>
              <h3>{a.name}</h3>
              <p>{a.description}</p>
              <div className="card-bottom">
                <span>
                  {a.rate === null
                    ? "全站 · 数据不足"
                    : `${a.label} · ${a.rate.toFixed(2)}%`}
                </span>
                <span>
                  {record ? record.completedAt : <ArrowUpRight size={15} />}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
  function section(
    title: string,
    eyebrow: string,
    items: Achievement[],
    empty: string,
  ) {
    return (
      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
          </div>
          <Link href="/achievements" className="text-link">
            浏览图鉴 <ArrowRight size={16} />
          </Link>
        </div>
        {items.length ? (
          cards(items)
        ) : (
          <div className="empty">
            <Trophy />
            <h3>{empty}</h3>
            <p>每一段经历，都值得被记住。从一件小事开始。</p>
            <Link href="/achievements" className="text-link">
              寻找你的第一个成就 <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
    );
  }
  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          <div className="brand-mark">
            <Trophy size={21} />
          </div>
          <div>
            LIFE <span>ACHIEVEMENTS</span>
            <small>人生 · 成就</small>
          </div>
        </Link>
        <nav>
          <Link className={page === "home" ? "active" : ""} href="/">
            <Compass size={17} />
            探索首页
          </Link>
          <Link
            className={page === "achievements" ? "active" : ""}
            href="/achievements"
          >
            <LayoutGrid size={17} />
            成就图鉴
          </Link>
          <Link className={page === "profile" ? "active" : ""} href="/profile">
            <UserRound size={17} />
            我的主页
          </Link>
        </nav>
        <button
          className="player-chip"
          onClick={() => {
            setError("");
            setProfile(true);
          }}
        >
          <span className="online" />
          <span>{user?.nickname || "创建档案"}</span>
          <Badge icon={user?.avatar || "compass"} />
        </button>
      </header>
      <main>
        <div className="breadcrumb">
          <span>你的现实世界冒险</span>
          <span>
            <i className="online" /> LOCAL PLAYER · 本地单用户
          </span>
        </div>
        {page === "home" && (
          <>
            <section className="hero">
              <div className="hero-grid" />
              <div className="hero-art" aria-hidden="true">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="planet" />
                <div className="mountains mountain-back" />
                <div className="mountains mountain-front" />
                <span className="coordinate">
                  22° N / 114° E<br />
                  THE WORLD IS YOURS TO EXPLORE
                </span>
                <div className="hero-emblem">
                  <Badge icon="compass" large />
                  <span>YOUR NEXT ADVENTURE AWAITS</span>
                </div>
              </div>
              <div className="hero-copy">
                <span className="eyebrow">
                  <span className="tiny-line" /> LIFE IS AN OPEN WORLD
                </span>
                <h1>
                  人生是一场
                  <br />
                  <em>开放世界游戏。</em>
                </h1>
                <p>
                  没有标准路线，也没有唯一结局。
                  <br />
                  去探索、去体验，解锁只属于你的人生成就。
                </p>
                <div className="hero-actions">
                  <Link href="/achievements" className="primary">
                    开启下一段冒险 <ArrowRight size={17} />
                  </Link>
                  <Link href="/profile" className="secondary">
                    我的成就档案 <ArrowUpRight size={16} />
                  </Link>
                </div>
                <div className="hero-note">
                  <ShieldCheck size={14} /> 自主记录 · 无需比较 · 每一步都算数
                </div>
              </div>
            </section>
            <div className="stats">
              <div>
                <span className="stat-icon">
                  <Trophy />
                </span>
                <div>
                  <small>已解锁成就</small>
                  <strong>
                    {unlocks.length}
                    <sub> / {total}</sub>
                  </strong>
                </div>
              </div>
              <div>
                <span className="stat-icon">
                  <LayoutGrid />
                </span>
                <div>
                  <small>人生探索进度</small>
                  <strong>
                    {percent}
                    <sub>%</sub>
                  </strong>
                  <div className="progress">
                    <i style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>
              <div>
                <span className="stat-icon">
                  <Compass />
                </span>
                <div>
                  <small>探索领域</small>
                  <strong>
                    {new Set(recent.map((a) => a.category)).size}
                    <sub> / 6</sub>
                  </strong>
                </div>
              </div>
              <div>
                <span className="stat-icon gold">
                  <Sparkles />
                </span>
                <div>
                  <small>下一枚成就</small>
                  <strong className="stat-message">故事，由你续写</strong>
                </div>
              </div>
            </div>
            {section(
              "最近解锁",
              "YOUR LATEST MILESTONES",
              recent.slice(0, 3),
              "你的故事，等待第一枚徽章",
            )}
            <section className="content-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">FIND YOUR NEXT QUEST</span>
                  <h2>世界很大，去探索吧</h2>
                </div>
                <Link className="text-link" href="/achievements">
                  全部 {total} 个成就 <ArrowRight size={16} />
                </Link>
              </div>
              <div className="category-strip">
                {categories.map((c, i) => (
                  <Link key={c} href={`/achievements?category=${i}`}>
                    <Badge
                      icon={
                        [
                          "globe",
                          "book",
                          "activity",
                          "briefcase",
                          "heart",
                          "sprout",
                        ][i]
                      }
                      category={i}
                    />
                    <span>{c}</span>
                    <small>
                      10 个成就 <ChevronRight size={12} />
                    </small>
                  </Link>
                ))}
              </div>
              {cards(
                data.achievements
                  .filter((a) => !unlocked.has(a.id))
                  .filter((_, i) => i % 10 === 0)
                  .slice(0, 3),
              )}
            </section>
            <div className="rarity-banner">
              <div className="rarity-symbol">
                <Sparkles size={32} />
              </div>
              <div>
                <span className="eyebrow">THE EXTRAORDINARY COLLECTION</span>
                <h2>每一枚稀有徽章，都有一个故事</h2>
                <p>
                  真实稀有度等待更多探险家的加入。当前 {data.total}{" "}
                  位有效用户，达到 100 位后开放分级。
                </p>
                <div className="rarity-legend">
                  {ranks.map((r, i) => (
                    <span key={r} className={`rarity-text-${i + 1}`}>
                      ◆ {r}
                    </span>
                  ))}
                </div>
              </div>
              <span className="muted-pill">数据不足</span>
            </div>
          </>
        )}
        {page === "achievements" && <CatalogHeader setCategory={setCategory} />}
        {page === "achievements" && (
          <>
            <div className="page-title">
              <div>
                <span className="eyebrow">THE ACHIEVEMENT ATLAS</span>
                <h1>
                  成就图鉴<span>人生不设限</span>
                </h1>
                <p>寻找下一次心动，把「有一天」变成「已完成」。</p>
              </div>
              <div className="atlas-progress">
                <strong>
                  {unlocks.length}
                  <small> / {total} 已解锁</small>
                </strong>
                <div className="progress">
                  <i style={{ width: `${percent}%` }} />
                </div>
                <small>探索进度 {percent}%</small>
              </div>
            </div>
            <div className="category-tabs">
              <button
                className={category < 0 ? "active" : ""}
                onClick={() => setCategory(-1)}
              >
                全部领域 <span>60</span>
              </button>
              {categories.map((c, i) => (
                <button
                  key={c}
                  className={category === i ? "active" : ""}
                  onClick={() => setCategory(i)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="filter-bar">
              <label className="search">
                <Search size={18} />
                <input
                  placeholder="搜索成就、经历或关键词…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label="解锁状态"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">全部状态</option>
                <option value="unlocked">已解锁</option>
                <option value="locked">未解锁</option>
              </select>
              <select
                aria-label="稀有度"
                value={rarity}
                onChange={(e) => setRarity(e.target.value)}
              >
                <option value="all">全部稀有度</option>
                {[...ranks, "数据不足"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <select
                aria-label="排序方式"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="default">默认排序</option>
                <option value="rate">解锁率从高到低</option>
                <option value="rare">稀有程度优先</option>
                <option value="difficulty">挑战难度优先</option>
              </select>
            </div>
            <div className="result-info">
              <span>
                发现 <b>{visible.length}</b> 个成就
              </span>
              <span>
                全站统计样本 {data.total} / 100 ·{" "}
                {data.total < 100 ? "数据不足" : "已开放统计"}
              </span>
            </div>
            {visible.length ? (
              cards(visible)
            ) : (
              <div className="empty">
                <Search />
                <h3>暂时没有匹配的成就</h3>
                <p>试试其他关键词或筛选条件。</p>
                <button
                  className="secondary"
                  onClick={() => {
                    setQuery("");
                    setCategory(-1);
                    setRarity("all");
                    setStatus("all");
                  }}
                >
                  清除筛选
                </button>
              </div>
            )}
            <p className="footnote">
              稀有度根据有效用户的真实解锁比例计算，与成就难度无关。样本不足时不参与稀有度与解锁率排名。
            </p>
          </>
        )}
        {page === "profile" && (
          <>
            <div className="profile-banner">
              <div className="profile-avatar">
                <Badge icon={user?.avatar || "compass"} large />
              </div>
              <div>
                <span className="eyebrow">PLAYER PROFILE · 独一无二的你</span>
                <h1>{user?.nickname || "未命名的探险家"}</h1>
                <p>{user?.bio || "不必赶路，去感受路。你的冒险才刚刚开始。"}</p>
                <span className="muted-pill">本地探险家</span>
              </div>
              <button
                className="secondary"
                onClick={() => {
                  setError("");
                  setProfile(true);
                }}
              >
                <Settings2 size={16} /> 编辑档案
              </button>
            </div>
            <div className="profile-summary">
              <div>
                <strong>{unlocks.length}</strong>
                <span>枚成就已解锁</span>
              </div>
              <div>
                <strong>
                  {percent}
                  <small>%</small>
                </strong>
                <span>总完成率</span>
              </div>
              <div>
                <strong>{new Set(recent.map((a) => a.category)).size}</strong>
                <span>个已探索领域</span>
              </div>
            </div>
            <section className="content-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">PERSONAL HALL OF FAME</span>
                  <h2>我的成就展示柜</h2>
                </div>
                <button
                  className="text-link"
                  onClick={() => {
                    setPicked(user?.showcase.map((s) => s.achievementId) || []);
                    setError("");
                    setShowcase(true);
                  }}
                >
                  布置展示柜 <Settings2 size={15} />
                </button>
              </div>
              <div className="showcase-grid">
                {Array.from({ length: 6 }, (_, i) => {
                  const a = data.achievements.find(
                    (a) => a.id === user?.showcase[i]?.achievementId,
                  );
                  return (
                    <button
                      key={i}
                      className={`showcase-slot ${a ? "filled" : ""}`}
                      onClick={() => {
                        if (a) open(a);
                        else {
                          setPicked(
                            user?.showcase.map((s) => s.achievementId) || [],
                          );
                          setError("");
                          setShowcase(true);
                        }
                      }}
                    >
                      {a ? (
                        <>
                          <Badge icon={a.icon} category={a.category} />
                          <h3>{a.name}</h3>
                          <small>{a.label}</small>
                        </>
                      ) : (
                        <>
                          <Plus size={25} />
                          <span>等待你的故事</span>
                          <small>SLOT 0{i + 1}</small>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
            <section className="content-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">YOUR WORLD, IN PROGRESS</span>
                  <h2>各领域探索进度</h2>
                </div>
              </div>
              <div className="category-progress">
                {categories.map((c, i) => {
                  const count = recent.filter((a) => a.category === i).length;
                  return (
                    <div key={c}>
                      <Badge
                        icon={
                          [
                            "globe",
                            "book",
                            "activity",
                            "briefcase",
                            "heart",
                            "sprout",
                          ][i]
                        }
                        category={i}
                      />
                      <div>
                        <div className="section-heading">
                          <h3>{c}</h3>
                          <small>{count} / 10</small>
                        </div>
                        <div className="progress">
                          <i style={{ width: `${count * 10}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            {section(
              "最近获得",
              "MEMORIES WORTH KEEPING",
              recent.slice(0, 3),
              "下一段回忆，正在路上",
            )}
            <div className="rarity-banner">
              <Sparkles size={30} />
              <div>
                <h2>最稀有的成就</h2>
                <p>
                  {data.total < 100
                    ? "当前统计样本不足，暂不评选最稀有成就。你的经历依然值得珍藏。"
                    : recent.length
                      ? "按真实解锁率查看你的珍藏。"
                      : "解锁后即可在这里查看稀有成就。"}
                </p>
                {data.total >= 100 && recent.length > 0 && (
                  <button
                    className="text-link"
                    onClick={() =>
                      open(
                        [...recent].sort(
                          (a, b) => (a.rate ?? 100) - (b.rate ?? 100),
                        )[0],
                      )
                    }
                  >
                    查看最稀有成就 <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
        <footer>
          <Link href="/" className="footer-brand">
            <Trophy size={17} /> LIFE ACHIEVEMENTS
          </Link>
          <span>人生没有白走的路，每一步都值得记录。</span>
          <small>LOCAL MVP · 自主申报 · 数据保存在本机</small>
        </footer>
      </main>
      {selected && (
        <Modal
          title={
            mode === "detail"
              ? "成就档案"
              : mode === "unlock"
                ? "记录你的高光时刻"
                : "取消解锁"
          }
          onClose={() => {
            if (!busy) setSelected(null);
          }}
        >
          <div className="detail-hero">
            <Badge icon={selected.icon} category={selected.category} large />
            <span className="eyebrow">{categories[selected.category]}</span>
            <h2>{selected.name}</h2>
            <p>{selected.description}</p>
          </div>
          <div className="detail-facts">
            <div>
              <small>稀有度 / 全站解锁率</small>
              <strong>
                {selected.rate === null
                  ? "数据不足"
                  : `${selected.label} / ${selected.rate.toFixed(2)}%`}
              </strong>
            </div>
            <div>
              <small>挑战难度（非稀有度）</small>
              <strong>
                {"◆".repeat(selected.difficulty)}
                {"◇".repeat(5 - selected.difficulty)}
              </strong>
            </div>
          </div>
          {mode === "detail" ? (
            <>
              <div className="condition">
                <h3>达成条件</h3>
                <p>{selected.condition}</p>
                <small>
                  自主申报，无需上传证明。请根据自己的意愿和实际情况选择。
                </small>
              </div>
              {unlocked.has(selected.id) ? (
                <>
                  <div className="memory">
                    <span>
                      <Check size={15} /> 已于{" "}
                      {unlocked.get(selected.id)?.completedAt} 解锁
                    </span>
                    <p>
                      {unlocked.get(selected.id)?.note ||
                        "这段经历，已经成为你的故事。"}
                    </p>
                  </div>
                  <button className="danger" onClick={() => setMode("revoke")}>
                    取消解锁
                  </button>
                </>
              ) : (
                <button
                  className="primary full"
                  onClick={() => {
                    if (!user) {
                      setSelected(null);
                      setProfile(true);
                    } else setMode("unlock");
                  }}
                >
                  <Trophy size={17} />
                  {user ? "解锁成就" : "创建档案后解锁"}
                </button>
              )}
            </>
          ) : mode === "unlock" ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                if (
                  await save({
                    action: "unlock",
                    id: selected.id,
                    date: f.get("date"),
                    note: f.get("note"),
                  })
                ) {
                  setToast(selected);
                  setSelected(null);
                }
              }}
            >
              <label className="field">
                完成日期
                <input
                  name="date"
                  type="date"
                  required
                  max={today()}
                  defaultValue={today()}
                />
              </label>
              <label className="field">
                写下这段经历 <small>选填 · 最多 500 字</small>
                <textarea
                  name="note"
                  maxLength={500}
                  rows={3}
                  placeholder="那天发生了什么？留给未来的自己…"
                />
              </label>
              <button className="primary full" disabled={busy}>
                {busy ? "正在保存…" : "确认，纪念这一刻"}
                <Check size={17} />
              </button>
            </form>
          ) : (
            <>
              <p className="warning-copy">
                确定取消「{selected.name}
                」吗？完成日期、经历说明及展示柜中的该成就会一并移除。
              </p>
              <div className="dialog-actions">
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() => setMode("detail")}
                >
                  保留成就
                </button>
                <button
                  className="danger"
                  disabled={busy}
                  onClick={async () => {
                    if (await save({ action: "revoke", id: selected.id }))
                      setSelected(null);
                  }}
                >
                  {busy ? "正在处理…" : "确认取消解锁"}
                </button>
              </div>
            </>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </Modal>
      )}
      {profile && (
        <Modal
          title={user ? "编辑探险家档案" : "欢迎，新的探险家"}
          onClose={() => {
            if (!busy) setProfile(false);
          }}
        >
          <p className="muted">
            给你的冒险起个名字。档案只保存在这台设备的数据库中。
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              if (
                await save({
                  action: "profile",
                  nickname: f.get("nickname"),
                  bio: f.get("bio"),
                  avatar: f.get("avatar"),
                })
              )
                setProfile(false);
            }}
          >
            <label className="field">
              昵称
              <input
                name="nickname"
                required
                maxLength={24}
                defaultValue={user?.nickname}
                placeholder="例如：漫游者"
              />
            </label>
            <label className="field">
              个人简介
              <textarea
                name="bio"
                maxLength={160}
                defaultValue={user?.bio}
                rows={3}
                placeholder="写一句属于你的冒险宣言"
              />
            </label>
            <fieldset className="avatar-options">
              <legend>选择头像</legend>
              {["compass", "mountain", "stars", "sprout"].map((a, i) => (
                <label key={a}>
                  <input
                    type="radio"
                    name="avatar"
                    value={a}
                    defaultChecked={(user?.avatar || "compass") === a}
                  />
                  <Badge icon={a} category={i} />
                  <span>{["探索者", "登山者", "追星者", "园艺家"][i]}</span>
                </label>
              ))}
            </fieldset>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="primary full" disabled={busy}>
              {busy ? "正在保存…" : "保存我的档案"}
              <ArrowRight size={17} />
            </button>
          </form>
        </Modal>
      )}
      {showcase && (
        <Modal
          title={`布置展示柜 · ${picked.length} / 6`}
          onClose={() => {
            if (!busy) setShowcase(false);
          }}
        >
          <p className="muted">选择最多 6 枚已解锁徽章，按选择顺序展示。</p>
          {recent.length ? (
            <div className="pick-list">
              {recent.map((a) => (
                <button
                  key={a.id}
                  className={picked.includes(a.id) ? "chosen" : ""}
                  onClick={() =>
                    setPicked(
                      picked.includes(a.id)
                        ? picked.filter((id) => id !== a.id)
                        : picked.length < 6
                          ? [...picked, a.id]
                          : picked,
                    )
                  }
                  disabled={!picked.includes(a.id) && picked.length >= 6}
                >
                  <Badge icon={a.icon} category={a.category} />
                  <span>{a.name}</span>
                  {picked.includes(a.id) ? (
                    <span>
                      {picked.indexOf(a.id) + 1} <Check size={15} />
                    </span>
                  ) : (
                    <Plus size={16} />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="empty">
              <Trophy />
              <p>先去解锁一枚成就，再来布置展示柜吧。</p>
              <Link href="/achievements" className="text-link">
                探索成就图鉴 <ArrowRight size={16} />
              </Link>
            </div>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button
            className="primary full"
            disabled={busy || !user}
            onClick={async () => {
              if (await save({ action: "showcase", ids: picked }))
                setShowcase(false);
            }}
          >
            {busy ? "正在保存…" : "保存展示柜"}
          </button>
        </Modal>
      )}
      {toast && (
        <div className="unlock-toast" role="status">
          <Badge icon={toast.icon} category={toast.category} />
          <div>
            <small>ACHIEVEMENT UNLOCKED</small>
            <h3>成就已解锁！</h3>
            <p>
              {toast.name} <span>· {toast.label}</span>
            </p>
          </div>
          <button
            className="icon-button"
            aria-label="关闭提示"
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
function CatalogHeader({ setCategory }: { setCategory: (c: number) => void }) {
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("category");
    if (q !== null && Number(q) >= 0 && Number(q) < 6) setCategory(Number(q));
  }, [setCategory]);
  return null;
}
