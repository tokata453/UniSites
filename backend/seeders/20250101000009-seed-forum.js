"use strict";
const { randomUUID } = require("crypto");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Fetch seeded users and categories
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    const categories = await queryInterface.sequelize.query(
      `SELECT id, slug FROM forum_categories`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const userMap = Object.fromEntries(users.map((u) => [u.email, u.id]));
    const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

    // Some environments seed an admin user with a different email.
    const admin = userMap["superadmin@gmail.com"] || userMap["admin@gmail.com"];
    const student1 = userMap["bophalim@gmail.com"];
    const student2 = userMap["pisethkem@gmail.com"];
    const student3 = userMap["channaryros@gmail.com"];
    const owner1 = userMap["darasok@gmail.com"];

    // Category slugs — match what was seeded in 20250101000001
    const general = catMap["general"] || catMap["general-discussion"];
    const admissions = catMap["admissions"];
    const scholarships = catMap["scholarships"];
    const campus = catMap["campus-life"] || catMap["campus"];
    const career = catMap["career"] || catMap["career-jobs"];
    const tech = catMap["technology"] || catMap["tech"];

    // Pick the first available category as fallback
    const fallback = categories[0]?.id;
    const pick = (c) => c || fallback;

    // ── Threads ───────────────────────────────────────────────────────────────
    const threads = [
      {
        id: randomUUID(),
        category_id: pick(admissions),
        author_id: student1,
        title:
          "What are the admission requirements for RUPP Computer Science 2026?",
        slug: "rupp-cs-admission-requirements-2026",
        content:
          "Hi everyone! I'm planning to apply for the Computer Science program at RUPP this year. Can anyone who has already gone through the process share what documents are needed and what the BAC II score requirement is? Also, is there an entrance exam? Any help would be appreciated!",
        tags: ["RUPP", "Computer Science", "Admission", "2026"],
        views: 824,
        reply_count: 5,
        like_count: 12,
        is_pinned: false,
        is_locked: false,
        is_official: false,
        last_reply_at: new Date("2026-02-10"),
        created_at: new Date("2026-02-05"),
        updated_at: new Date("2026-02-10"),
      },
      {
        id: randomUUID(),
        category_id: pick(scholarships),
        author_id: student2,
        title: "Tips for applying to the MEXT Japanese Government Scholarship?",
        slug: "mext-scholarship-tips-2026",
        content:
          "I've been researching the MEXT scholarship for 2026 and I'm feeling a bit overwhelmed by the process. Has anyone here applied before or is currently studying in Japan on MEXT? I would love advice on: 1) How to write a strong research plan, 2) What the interview is like, 3) How long the process takes. Thank you so much!",
        tags: ["MEXT", "Japan", "Scholarship", "Tips"],
        views: 2340,
        reply_count: 8,
        like_count: 45,
        is_pinned: true,
        is_locked: false,
        is_official: false,
        last_reply_at: new Date("2026-02-20"),
        created_at: new Date("2026-01-15"),
        updated_at: new Date("2026-02-20"),
      },
      {
        id: randomUUID(),
        category_id: pick(general),
        author_id: admin,
        title: "📌 Welcome to the UniSites Forum — Read Before Posting!",
        slug: "welcome-to-unisites-forum",
        content:
          "Welcome to the UniSites Community Forum! 🎓\n\nThis is a safe space for Cambodian students to ask questions, share experiences, and help each other navigate university life. Here are a few guidelines:\n\n✅ Be respectful and supportive\n✅ Post in the correct category\n✅ Search before asking — your question may already be answered\n✅ No spam or self-promotion\n✅ Share your knowledge generously\n\nWe're happy to have you here. Good luck with your studies!",
        tags: ["Welcome", "Guidelines", "Announcement"],
        views: 4500,
        reply_count: 2,
        like_count: 89,
        is_pinned: true,
        is_locked: false,
        is_official: true,
        last_reply_at: new Date("2026-01-20"),
        created_at: new Date("2026-01-01"),
        updated_at: new Date("2026-01-20"),
      },
      {
        id: randomUUID(),
        category_id: pick(campus),
        author_id: student3,
        title: "Best affordable places to eat near ITC campus?",
        slug: "affordable-food-near-itc-campus",
        content:
          "Hey ITC students! I just started my first year and I'm looking for good affordable places to eat near campus. The cafeteria is okay but I want to explore other options. Any recommendations for lunch spots within walking distance? Budget is around $2-3 per meal. Thanks!",
        tags: ["ITC", "Food", "Campus Life", "Budget"],
        views: 1120,
        reply_count: 11,
        like_count: 34,
        is_pinned: false,
        is_locked: false,
        is_official: false,
        last_reply_at: new Date("2026-02-22"),
        created_at: new Date("2026-02-08"),
        updated_at: new Date("2026-02-22"),
      },
      {
        id: randomUUID(),
        category_id: pick(career),
        author_id: student1,
        title:
          "How to get your first tech job in Cambodia as a fresh graduate?",
        slug: "first-tech-job-cambodia-fresh-graduate",
        content:
          "I'm graduating from my CS program this semester and starting to look for jobs. The job market feels competitive and I'm not sure where to start. Should I focus on local companies or try for international remote jobs? What skills are Cambodian tech companies looking for in 2026? Any seniors or working professionals here who can share their experience?",
        tags: ["Career", "Tech Jobs", "Fresh Graduate", "Cambodia"],
        views: 3200,
        reply_count: 15,
        like_count: 67,
        is_pinned: false,
        is_locked: false,
        is_official: false,
        last_reply_at: new Date("2026-03-01"),
        created_at: new Date("2026-01-28"),
        updated_at: new Date("2026-03-01"),
      },
      {
        id: randomUUID(),
        category_id: pick(admissions),
        author_id: student2,
        title: "AUPP vs Norton University — Which is better for Business?",
        slug: "aupp-vs-norton-business-comparison",
        content:
          "I got accepted into both AUPP and Norton University for Business Administration. AUPP is more expensive but has the American affiliation. Norton seems more affordable and has a good reputation too. Can anyone share their experience at either university? What are the pros and cons for business specifically? I need to decide by the end of the month.",
        tags: ["AUPP", "Norton", "Business", "Comparison"],
        views: 2800,
        reply_count: 13,
        like_count: 52,
        is_pinned: false,
        is_locked: false,
        is_official: false,
        last_reply_at: new Date("2026-02-28"),
        created_at: new Date("2026-02-10"),
        updated_at: new Date("2026-02-28"),
      },
      {
        id: randomUUID(),
        category_id: pick(tech || general),
        author_id: owner1,
        title:
          "Is learning Python or JavaScript better for career in Cambodia?",
        slug: "python-vs-javascript-cambodia-career",
        content:
          "I'm trying to decide which programming language to focus on learning. Python seems popular for data science and AI, but JavaScript is everywhere for web development. For the Cambodian job market specifically, which one would give me better opportunities? I'm a first-year CS student with basic programming knowledge.",
        tags: ["Programming", "Python", "JavaScript", "Career", "Cambodia"],
        views: 1560,
        reply_count: 9,
        like_count: 41,
        is_pinned: false,
        is_locked: false,
        is_official: false,
        last_reply_at: new Date("2026-02-25"),
        created_at: new Date("2026-02-12"),
        updated_at: new Date("2026-02-25"),
      },
    ];

    const threadSlugs = threads.map((thread) => thread.slug);
    const existingThreads = await queryInterface.sequelize.query(
      `SELECT id FROM forum_threads WHERE slug = ANY(ARRAY[:threadSlugs])`,
      {
        replacements: { threadSlugs },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      },
    );
    const existingThreadIds = existingThreads.map((thread) => thread.id);

    if (existingThreadIds.length > 0) {
      const existingReplies = await queryInterface.sequelize.query(
        `SELECT id FROM forum_replies WHERE thread_id = ANY(ARRAY[:threadIds]::uuid[])`,
        {
          replacements: { threadIds: existingThreadIds },
          type: queryInterface.sequelize.QueryTypes.SELECT,
        },
      );
      const existingReplyIds = existingReplies.map((reply) => reply.id);

      if (existingReplyIds.length > 0) {
        await queryInterface.bulkDelete("forum_likes", {
          reply_id: existingReplyIds,
        });
      }

      await queryInterface.bulkDelete("forum_replies", {
        thread_id: existingThreadIds,
      });

      await queryInterface.bulkDelete("forum_threads", {
        id: existingThreadIds,
      });
    }

    await queryInterface.bulkInsert("forum_threads", threads);

    // Fetch inserted thread IDs
    const insertedThreads = await queryInterface.sequelize.query(
      `SELECT id, slug FROM forum_threads`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    const threadMap = Object.fromEntries(
      insertedThreads.map((t) => [t.slug, t.id]),
    );

    // ── Replies ───────────────────────────────────────────────────────────────
    const replies = [
      // Thread: RUPP CS Admission
      {
        id: randomUUID(),
        thread_id: threadMap["rupp-cs-admission-requirements-2026"],
        author_id: student3,
        parent_id: null,
        content:
          "Hi! I applied last year and got in. You need: BAC II certificate, ID card, 2 photos, and an application form from the RUPP website. There is no separate entrance exam for CS — they use your BAC II score. Grade B or above is usually enough. Good luck! 🍀",
        like_count: 18,
        is_official: false,
        is_accepted: true,
        is_deleted: false,
        created_at: new Date("2026-02-06"),
        updated_at: new Date("2026-02-06"),
      },
      {
        id: randomUUID(),
        thread_id: threadMap["rupp-cs-admission-requirements-2026"],
        author_id: admin,
        parent_id: null,
        content:
          "Official answer: RUPP Computer Science requires BAC II Grade B or above. Required documents include high school certificate, national ID, 2 passport photos, and a completed application form. Application fee is $15. Applications open June–August each year. Visit rupp.edu.kh for the exact portal.",
        like_count: 32,
        is_official: true,
        is_accepted: false,
        is_deleted: false,
        created_at: new Date("2026-02-07"),
        updated_at: new Date("2026-02-07"),
      },
      // Thread: MEXT Tips
      {
        id: randomUUID(),
        thread_id: threadMap["mext-scholarship-tips-2026"],
        author_id: owner1,
        parent_id: null,
        content:
          "I'm currently studying in Osaka on MEXT! Here's my advice:\n\n1. Research plan: Be very specific. Name the lab, the professor, and how your research connects to Cambodia's development. Show you have read their published papers.\n\n2. Interview: It's mostly in English. They ask why you chose Japan, your research goals, and your Japanese language plans. Stay calm and be honest.\n\n3. Timeline: From application to departure is about 8-10 months. Start early!",
        like_count: 56,
        is_official: false,
        is_accepted: true,
        is_deleted: false,
        created_at: new Date("2026-01-18"),
        updated_at: new Date("2026-01-18"),
      },
      {
        id: randomUUID(),
        thread_id: threadMap["mext-scholarship-tips-2026"],
        author_id: student1,
        parent_id: null,
        content:
          "Also note that the Embassy recommendation and University recommendation are two different channels! The Embassy channel has the scholarship screening done by the Japanese Embassy in Phnom Penh, while the University channel requires you to already be in contact with a Japanese professor. The Embassy route is more common for Cambodians.",
        like_count: 29,
        is_official: false,
        is_accepted: false,
        is_deleted: false,
        created_at: new Date("2026-01-22"),
        updated_at: new Date("2026-01-22"),
      },
      // Thread: Welcome
      {
        id: randomUUID(),
        thread_id: threadMap["welcome-to-unisites-forum"],
        author_id: student2,
        parent_id: null,
        content:
          "Thank you for creating this platform! This is exactly what Cambodian students need. Looking forward to learning from everyone here 🙏",
        like_count: 14,
        is_official: false,
        is_accepted: false,
        is_deleted: false,
        created_at: new Date("2026-01-10"),
        updated_at: new Date("2026-01-10"),
      },
      // Thread: Food near ITC
      {
        id: randomUUID(),
        thread_id: threadMap["affordable-food-near-itc-campus"],
        author_id: student2,
        parent_id: null,
        content:
          "There's a great bai sach chruk (pork and rice) stall about 5 minutes walk from the main gate. $1.50 and it's delicious! There are also a few noodle shops along the main road. For $2–3 you can eat really well in that area.",
        like_count: 22,
        is_official: false,
        is_accepted: true,
        is_deleted: false,
        created_at: new Date("2026-02-09"),
        updated_at: new Date("2026-02-09"),
      },
      // Thread: First tech job
      {
        id: randomUUID(),
        thread_id: threadMap["first-tech-job-cambodia-fresh-graduate"],
        author_id: owner1,
        parent_id: null,
        content:
          "Fresh grad here with 2 years of experience now. My advice:\n\n1. Build a portfolio — GitHub with 3-5 real projects is worth more than your GPA to most tech companies.\n2. Apply to local startups first — they're more willing to hire fresh grads and the learning is faster.\n3. Top companies hiring in Cambodia: NHAM24, Pi Pay, Sabay, Wing Bank, and many NGOs with tech roles.\n4. Remote jobs are possible but hard without 1-2 years local experience first.\n\nGood luck!",
        like_count: 78,
        is_official: false,
        is_accepted: true,
        is_deleted: false,
        created_at: new Date("2026-01-30"),
        updated_at: new Date("2026-01-30"),
      },
      // Thread: AUPP vs Norton
      {
        id: randomUUID(),
        thread_id: threadMap["aupp-vs-norton-business-comparison"],
        author_id: student3,
        parent_id: null,
        content:
          "I studied at Norton for business and I'm happy with it. The teachers are experienced and many have worked in industry. The price is much more reasonable than AUPP. If you're on a budget, Norton is a solid choice. If you want an international-recognized degree and can afford it, AUPP is worth the premium.",
        like_count: 41,
        is_official: false,
        is_accepted: false,
        is_deleted: false,
        created_at: new Date("2026-02-12"),
        updated_at: new Date("2026-02-12"),
      },
      // Thread: Python vs JS
      {
        id: randomUUID(),
        thread_id: threadMap["python-vs-javascript-cambodia-career"],
        author_id: student1,
        parent_id: null,
        content:
          "From what I've seen in job postings in Cambodia, JavaScript (especially React + Node.js) is more in demand for web development roles which are the most common. Python is better if you want to go into data science or AI which is growing but fewer local jobs right now. I'd recommend starting with JavaScript for faster employment, then adding Python later.",
        like_count: 35,
        is_official: false,
        is_accepted: true,
        is_deleted: false,
        created_at: new Date("2026-02-14"),
        updated_at: new Date("2026-02-14"),
      },
    ];

    await queryInterface.bulkInsert("forum_replies", replies);

    // ── ForumLikes (a few likes on replies) ───────────────────────────────────
    const insertedReplies = await queryInterface.sequelize.query(
      `SELECT fr.id
       FROM forum_replies fr
       JOIN forum_threads ft ON ft.id = fr.thread_id
       WHERE ft.slug = ANY(ARRAY[:threadSlugs])
       ORDER BY fr.created_at ASC
       LIMIT 5`,
      {
        replacements: { threadSlugs },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      },
    );
    const likeUsers = [student1, student2, student3].filter(Boolean);
    const likes = [];
    insertedReplies.forEach((reply, i) => {
      const liker = likeUsers[i % likeUsers.length];
      if (liker) {
        likes.push({
          id: randomUUID(),
          reply_id: reply.id,
          user_id: liker,
          created_at: now,
          updated_at: now,
        });
      }
    });
    if (likes.length) await queryInterface.bulkInsert("forum_likes", likes);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("forum_likes", null, {});
    await queryInterface.bulkDelete("forum_replies", null, {});
    await queryInterface.bulkDelete("forum_threads", null, {});
  },
};
