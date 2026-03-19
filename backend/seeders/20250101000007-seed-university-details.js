"use strict";
const { randomUUID } = require("crypto");
const {
  createContentImage,
  createUniversityCover,
  createUniversityLogo,
  isSeedFallbackImage,
} = require("../utils/mediaPlaceholders");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const unis = await queryInterface.sequelize.query(
      `SELECT id, slug, name, province, type, email, phone, facebook_url, website_url, founded_year, location, address, accreditation, description, description_km, meta_title, meta_description, instagram_url, youtube_url, linkedin_url, tiktok_url, logo_url, cover_url FROM universities`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    const uniMap = Object.fromEntries(unis.map((u) => [u.slug, u.id]));

    const rupp = uniMap["royal-university-of-phnom-penh"];
    const itc = uniMap["institute-of-technology-of-cambodia"];
    const norton = uniMap["norton-university"];
    const puc = uniMap["paññāsāstra-university-of-cambodia"] || uniMap["paññasastra-university-of-cambodia"];
    const aupp = uniMap["american-university-of-phnom-penh"];
    const uc = uniMap["university-of-cambodia"];
    const num = uniMap["national-university-of-management"];
    const rule = uniMap["royal-university-of-law-and-economics"];
    const camtech = uniMap["camtech-university"];
    const allIds = unis.map((u) => u.id).filter(Boolean);

    // Make this seeder rerunnable for the universities currently in the database.
    await queryInterface.bulkDelete("university_testimonials", {
      university_id: allIds,
    });
    await queryInterface.bulkDelete("university_events", {
      university_id: allIds,
    });
    await queryInterface.bulkDelete("university_news", {
      university_id: allIds,
    });
    await queryInterface.bulkDelete("university_faqs", {
      university_id: allIds,
    });
    await queryInterface.bulkDelete("admission_requirements", {
      university_id: allIds,
    });
    await queryInterface.bulkDelete("campus_facilities", {
      university_id: allIds,
    });
    await queryInterface.bulkDelete("university_contacts", {
      university_id: allIds,
    });

    const getAcademicFocus = (uni) => {
      const name = (uni.name || "").toLowerCase();
      if (name.includes("health") || name.includes("medical") || name.includes("puthisastra")) {
        return "health sciences, clinical training, and healthcare management";
      }
      if (name.includes("agriculture")) {
        return "agriculture, agribusiness, sustainability, and rural development";
      }
      if (name.includes("law") || name.includes("economics")) {
        return "law, economics, public policy, and management";
      }
      if (
        name.includes("technology") ||
        name.includes("polytechnic") ||
        name.includes("engineering") ||
        name.includes("science")
      ) {
        return "engineering, technology, science, and applied innovation";
      }
      if (name.includes("business") || name.includes("management")) {
        return "business, finance, entrepreneurship, and professional management";
      }
      if (name.includes("education")) {
        return "education, leadership, and teacher development";
      }
      return "business, social sciences, digital skills, and professional development";
    };

    for (const uni of unis) {
      const focus = getAcademicFocus(uni);
      const typeLabel = uni.type || "higher education";
      const generatedDescription =
        `${uni.name} is a ${typeLabel} higher education institution in ${uni.province || "Cambodia"}, serving students through programs in ${focus}. It supports learners with campus services, admissions guidance, and career-focused study pathways.`;
      const generatedMetaDescription =
        `${uni.name} in ${uni.province || "Cambodia"}, Cambodia, offering study options in ${focus}.`;

      await queryInterface.bulkUpdate(
        "universities",
        {
          logo_url: uni.logo_url || createUniversityLogo(uni.name, uni.type || "university"),
          cover_url: (!uni.cover_url || isSeedFallbackImage(uni.cover_url))
            ? createUniversityCover(uni.name, uni.province || "Cambodia", uni.type || "university")
            : uni.cover_url,
          description: uni.description || generatedDescription,
          accreditation: uni.accreditation || "Accreditation Committee of Cambodia (ACC)",
          location: uni.location || `${uni.province || "Cambodia"}, Cambodia`,
          address:
            uni.address ||
            uni.location ||
            `${uni.province || "Cambodia"}, Cambodia`,
          meta_title: uni.meta_title || uni.name,
          meta_description: uni.meta_description || generatedMetaDescription,
          updated_at: now,
        },
        { id: uni.id },
      );
    }

    // ── UniversityContact ─────────────────────────────────────────────────────
    const contactOverrides = {
      "royal-university-of-phnom-penh": {
        admission_email: "admission@rupp.edu.kh",
        admission_phone: "+855 23 880 116",
        general_email: "info@rupp.edu.kh",
        general_phone: "+855 23 880 116",
        facebook_page: "https://facebook.com/rupp.edu.kh",
        office_hours: "Mon-Fri 7:30am - 5:00pm",
      },
      "institute-of-technology-of-cambodia": {
        admission_email: "admission@itc.edu.kh",
        admission_phone: "+855 23 880 370",
        general_email: "info@itc.edu.kh",
        general_phone: "+855 23 880 370",
        facebook_page: "https://facebook.com/itc.edu.kh",
        office_hours: "Mon-Fri 7:30am - 5:30pm",
      },
      "norton-university": {
        admission_email: "info@norton.edu.kh",
        admission_phone: "+855 23 987 701",
        general_email: "info@norton.edu.kh",
        general_phone: "+855 23 987 701",
        facebook_page: "https://facebook.com/nortonuniversity",
        office_hours: "Mon-Sat 7:30am - 6:00pm",
      },
      "paññāsastra-university-of-cambodia": {
        admission_email: "admissions@puc.edu.kh",
        admission_phone: "+855 23 990 153",
        general_email: "info@puc.edu.kh",
        general_phone: "+855 23 990 153",
        facebook_page: "https://facebook.com/PUCambodia",
        office_hours: "Mon-Fri 8:00am - 5:00pm",
      },
      "american-university-of-phnom-penh": {
        admission_email: "admissions@aupp.edu.kh",
        admission_phone: "+855 23 969 248",
        general_email: "info@aupp.edu.kh",
        general_phone: "+855 23 969 248",
        facebook_page: "https://facebook.com/AUPPCambodia",
        office_hours: "Mon-Fri 8:00am - 5:30pm",
      },
      "university-of-cambodia": {
        admission_email: "admissions@uc.edu.kh",
        admission_phone: "+855 23 993 274",
        general_email: "info@uc.edu.kh",
        general_phone: "+855 23 993 274",
        facebook_page: "https://facebook.com/universityofcambodia",
        office_hours: "Mon-Fri 8:00am - 5:00pm",
      },
      "national-university-of-management": {
        admission_email: "info.numdigital@num.edu.kh",
        admission_phone: "+855 12 549 961",
        general_email: "info.numdigital@num.edu.kh",
        general_phone: "+855 12 549 961",
        office_hours: "Mon-Fri 7:30am - 5:00pm",
      },
      "royal-university-of-law-and-economics": {
        admission_email: "info@rule.edu.kh",
        admission_phone: "+855 23 214 703",
        general_email: "info@rule.edu.kh",
        general_phone: "+855 23 214 703",
        office_hours: "Mon-Fri 7:30am - 5:00pm",
      },
      "camtech-university": {
        admission_email: "info@camtech.edu.kh",
        admission_phone: "+855 78 21 21 81",
        general_email: "info@camtech.edu.kh",
        general_phone: "+855 78 21 21 81",
        office_hours: "Mon-Sat 8:00am - 5:00pm",
      },
    };
    const contacts = unis.map((uni) => {
      const override = contactOverrides[uni.slug] || {};
      const mapQuery = uni.address || uni.location || `${uni.name} ${uni.province || "Cambodia"}`;
      return {
        id: randomUUID(),
        university_id: uni.id,
        admission_email: override.admission_email || uni.email || null,
        admission_phone: override.admission_phone || uni.phone || null,
        admissions_url: uni.website_url || null,
        programs_url: uni.website_url || null,
        about_url: uni.website_url || null,
        general_email: override.general_email || uni.email || null,
        general_phone: override.general_phone || uni.phone || null,
        facebook_page: override.facebook_page || uni.facebook_url || null,
        instagram: uni.instagram_url || null,
        youtube: uni.youtube_url || null,
        linkedin: uni.linkedin_url || null,
        tiktok: uni.tiktok_url || null,
        office_hours:
          override.office_hours ||
          (uni.type === "private" ? "Mon-Sat 8:00am - 5:00pm" : "Mon-Fri 8:00am - 5:00pm"),
        map_embed_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`,
        created_at: now,
        updated_at: now,
      };
    }).filter((c) => c.university_id);
    await queryInterface.bulkInsert("university_contacts", contacts, {
      ignoreDuplicates: true,
    });

    // ── CampusFacilities ──────────────────────────────────────────────────────
    const facilities = [];
    const facilityData = [
      {
        name: "Library",
        icon: "📚",
        category: "academic",
        description:
          "Large library with extensive collections of books, journals and digital resources.",
      },
      {
        name: "Computer Lab",
        icon: "💻",
        category: "academic",
        description: "Modern computer labs with high-speed internet access.",
      },
      {
        name: "Sports Complex",
        icon: "⚽",
        category: "sports",
        description:
          "Multi-purpose sports facility including football field and basketball courts.",
      },
      {
        name: "Student Cafeteria",
        icon: "🍽️",
        category: "dining",
        description:
          "Affordable cafeteria serving Khmer and international cuisine.",
      },
      {
        name: "Health Center",
        icon: "🏥",
        category: "health",
        description:
          "On-campus medical clinic providing basic health services to students.",
      },
      {
        name: "Career Center",
        icon: "🎯",
        category: "other",
        description:
          "Career advising, internship support, and employer engagement services for students and graduates.",
      },
      {
        name: "Student Lounge",
        icon: "🪑",
        category: "recreation",
        description:
          "Shared student space for study groups, clubs, and informal academic collaboration.",
      },
    ];
    allIds.forEach((uniId) => {
      facilityData.forEach((f) => {
        facilities.push({
          id: randomUUID(),
          university_id: uniId,
          ...f,
          is_available: true,
          created_at: now,
          updated_at: now,
        });
      });
    });
    // AUPP extra
    if (aupp)
      facilities.push({
        id: randomUUID(),
        university_id: aupp,
        name: "Student Dormitory",
        icon: "🏠",
        category: "housing",
        description:
          "On-campus housing available for international and domestic students.",
        is_available: true,
        created_at: now,
        updated_at: now,
      });
    await queryInterface.bulkInsert("campus_facilities", facilities, {
      ignoreDuplicates: true,
    });

    // ── AdmissionRequirements ─────────────────────────────────────────────────
    const admissions = [];
    const admissionData = [
      {
        title: "High School Diploma",
        requirement_type: "document",
        description: "Copy of Grade 12 graduation certificate or equivalent.",
        is_mandatory: true,
        sort_order: 1,
      },
      {
        title: "National Exam Score",
        requirement_type: "exam",
        description: "BAC II national examination result with passing score.",
        is_mandatory: true,
        sort_order: 2,
      },
      {
        title: "ID Card or Passport",
        requirement_type: "document",
        description: "Valid national ID or passport copy.",
        is_mandatory: true,
        sort_order: 3,
      },
      {
        title: "Passport Photo",
        requirement_type: "document",
        description: "2 recent passport-sized photographs (4x6 cm).",
        is_mandatory: true,
        sort_order: 4,
      },
      {
        title: "English Proficiency (AUPP)",
        requirement_type: "language",
        description:
          "TOEFL iBT 61+ or IELTS 5.5+ required for English programs.",
        is_mandatory: false,
        sort_order: 5,
      },
    ];
    allIds.forEach((uniId) => {
      admissionData.forEach((a) => {
        if (a.title.includes("AUPP") && uniId !== aupp) return;
        admissions.push({
          id: randomUUID(),
          university_id: uniId,
          program_id: null,
          ...a,
          deadline: "2025-09-01",
          intake_period: "September 2025",
          created_at: now,
          updated_at: now,
        });
      });
    });
    await queryInterface.bulkInsert("admission_requirements", admissions, {
      ignoreDuplicates: true,
    });

    // ── UniversityFAQs ────────────────────────────────────────────────────────
    const faqs = [];
    const faqData = [
      {
        question: "What is the application deadline?",
        answer:
          "Applications are accepted from June to August each year. Early applications are encouraged as seats are limited.",
        category: "Admission",
        sort_order: 1,
      },
      {
        question: "Are scholarships available?",
        answer:
          "Yes, we offer merit-based and need-based scholarships. Please contact the scholarship office for details.",
        category: "Finance",
        sort_order: 2,
      },
      {
        question: "Is there on-campus housing?",
        answer:
          "Limited on-campus housing is available. Off-campus housing assistance is provided through the student affairs office.",
        category: "Campus",
        sort_order: 3,
      },
      {
        question: "What languages are courses taught in?",
        answer:
          "Most undergraduate programs are taught in Khmer. Selected programs and postgraduate courses are offered in English.",
        category: "Academic",
        sort_order: 4,
      },
      {
        question: "How do I transfer credits from another university?",
        answer:
          "Credit transfer requests are reviewed by the academic registrar. Please submit official transcripts for evaluation.",
        category: "Academic",
        sort_order: 5,
      },
    ];
    allIds.forEach((uniId) => {
      faqData.forEach((f) => {
        faqs.push({
          id: randomUUID(),
          university_id: uniId,
          ...f,
          is_published: true,
          created_at: now,
          updated_at: now,
        });
      });
    });
    await queryInterface.bulkInsert("university_faqs", faqs, {
      ignoreDuplicates: true,
    });

    // ── UniversityNews ────────────────────────────────────────────────────────
    const newsItems = [
      {
        university_id: rupp,
        title: "RUPP Launches New AI Research Center",
        slug: "rupp-ai-research-center-2025",
        excerpt:
          "The Royal University of Phnom Penh has established a new Artificial Intelligence Research Center to advance Cambodia's tech capabilities.",
        content:
          "The Royal University of Phnom Penh proudly announces the inauguration of its AI Research Center in partnership with international technology organizations. The center will focus on machine learning, natural language processing for Khmer language, and smart agriculture solutions. Students and faculty are invited to participate in research projects starting January 2026.",
        category: "Research",
        tags: ["AI", "Research", "Technology"],
        is_published: true,
        is_pinned: true,
        views_count: 1240,
        published_at: new Date("2025-11-15"),
      },
      {
        university_id: rupp,
        title: "RUPP Ranks #1 Among Cambodian Universities",
        slug: "rupp-ranks-first-cambodia-2025",
        excerpt:
          "For the third consecutive year, RUPP has been ranked as the top university in Cambodia.",
        content:
          "The Royal University of Phnom Penh has retained its position as the number one university in Cambodia according to the 2025 national university ranking. The ranking considers academic quality, research output, student satisfaction, and graduate employment rates. RUPP scored highest in research publications and faculty qualifications.",
        category: "Achievement",
        tags: ["Ranking", "Achievement"],
        is_published: true,
        is_pinned: false,
        views_count: 3200,
        published_at: new Date("2025-10-01"),
      },
      {
        university_id: itc,
        title: "ITC Students Win National Robotics Competition",
        slug: "itc-robotics-win-2025",
        excerpt:
          "A team of ITC students claimed first place at the 2025 Cambodia National Robotics Championship.",
        content:
          "Students from the Department of Electrical Engineering at ITC won the Cambodia National Robotics Championship 2025. The team, consisting of four final-year students, designed an autonomous robot capable of navigating complex terrains. Their victory earns them a spot at the ASEAN Robotics Championship to be held in Singapore in March 2026.",
        category: "Achievement",
        tags: ["Robotics", "Competition"],
        is_published: true,
        is_pinned: true,
        views_count: 890,
        published_at: new Date("2025-12-01"),
      },
      {
        university_id: norton,
        title: "Norton University Opens New IT Innovation Lab",
        slug: "norton-it-lab-opening-2025",
        excerpt:
          "Norton University has opened a state-of-the-art IT Innovation Lab to enhance practical learning for computer science students.",
        content:
          "Norton University celebrated the opening of its new IT Innovation Lab, equipped with 80 high-performance workstations, virtual reality development kits, and cloud computing access. The lab was funded through a partnership with a leading technology company and will serve over 500 students annually.",
        category: "Campus",
        tags: ["Technology", "Lab", "IT"],
        is_published: true,
        is_pinned: false,
        views_count: 560,
        published_at: new Date("2025-11-20"),
      },
      {
        university_id: aupp,
        title: "AUPP Partners with University of Arizona",
        slug: "aupp-arizona-partnership-2026",
        excerpt:
          "AUPP has strengthened its partnership with the University of Arizona, offering dual-degree opportunities for students.",
        content:
          "The American University of Phnom Penh has announced an expanded partnership with the University of Arizona, enabling students to pursue dual-degree programs. Students can now complete 2 years at AUPP and 2 years at University of Arizona, graduating with degrees from both institutions. Financial aid and scholarship opportunities are available for eligible students.",
        category: "Partnership",
        tags: ["Partnership", "International"],
        is_published: true,
        is_pinned: true,
        views_count: 2100,
        published_at: new Date("2026-01-10"),
      },
    ];
    const curatedNewsUniversityIds = new Set(
      newsItems.map((n) => n.university_id).filter(Boolean),
    );
    const generatedNewsItems = unis
      .filter((uni) => !curatedNewsUniversityIds.has(uni.id))
      .flatMap((uni, index) => ([
        {
          university_id: uni.id,
          title: `${uni.name} Shares 2026 Admissions and Student Support Updates`,
          slug: `${uni.slug}-admissions-and-student-support-2026`,
          excerpt: `${uni.name} has published updated admissions guidance, student service information, and campus support highlights for the 2026 intake.`,
          content: `${uni.name} has announced updated admissions guidance for the 2026 academic year, including application timelines, student support information, and campus service updates for new applicants in ${uni.province || "Cambodia"}. Prospective students are encouraged to contact the admissions office for the latest program and scholarship information.`,
          category: "Admission",
          tags: ["Admissions", "Student Support", uni.province || "Cambodia"],
          is_published: true,
          is_pinned: index < 6,
          views_count: 180 + index * 17,
          published_at: new Date("2026-01-15"),
        },
        {
          university_id: uni.id,
          title: `${uni.name} Highlights Student Activities and Campus Services`,
          slug: `${uni.slug}-student-activities-and-campus-services-2026`,
          excerpt: `${uni.name} is highlighting student life initiatives, campus services, and support resources available to current and incoming students.`,
          content: `${uni.name} has highlighted student clubs, advising support, library access, and campus service points for the current academic year. The update is designed to help students in ${uni.province || "Cambodia"} navigate campus life more confidently and make the most of available resources.`,
          category: "Campus",
          tags: ["Campus Life", "Student Services", uni.province || "Cambodia"],
          is_published: true,
          is_pinned: false,
          views_count: 120 + index * 11,
          published_at: new Date("2026-02-05"),
        },
      ]));
    const newsToInsert = [...newsItems, ...generatedNewsItems]
      .filter((n) => n.university_id)
      .map((n) => {
        const fallbackImage = createContentImage(
          n.title,
          n.category || "News",
          n.excerpt || n.content || "University update",
        );
        return {
          id: randomUUID(),
          author_id: null,
          cover_url: n.cover_url || fallbackImage,
          image_urls:
            Array.isArray(n.image_urls) && n.image_urls.length
              ? n.image_urls
              : [n.cover_url || fallbackImage],
          ...n,
          created_at: now,
          updated_at: now,
        };
      });
    await queryInterface.bulkInsert("university_news", newsToInsert, {
      ignoreDuplicates: true,
    });

    // ── UniversityEvents ──────────────────────────────────────────────────────
    const events = [
      {
        university_id: rupp,
        title: "RUPP Open Day 2026",
        type: "open_day",
        event_date: new Date("2026-04-15 08:00:00"),
        end_date: new Date("2026-04-15 17:00:00"),
        location: "RUPP Main Campus, Phnom Penh",
        description:
          "Join us for RUPP Open Day! Explore faculties, meet professors, and learn about admission requirements. Free registration.",
        registration_url: "https://rupp.edu.kh/openday",
        max_participants: 2000,
        is_published: true,
        is_featured: true,
      },
      {
        university_id: rupp,
        title: "Annual Science Exhibition",
        type: "other",
        event_date: new Date("2026-05-20 09:00:00"),
        end_date: new Date("2026-05-22 17:00:00"),
        location: "RUPP Science Building",
        description:
          "Student research projects and scientific innovations on display. Open to the public.",
        registration_url: null,
        max_participants: 500,
        is_published: true,
        is_featured: false,
      },
      {
        university_id: itc,
        title: "ITC Tech Summit 2026",
        type: "seminar",
        event_date: new Date("2026-03-28 08:30:00"),
        end_date: new Date("2026-03-28 17:30:00"),
        location: "ITC Conference Hall, Phnom Penh",
        description:
          "Annual technology summit featuring industry leaders, startup pitches, and hands-on workshops on AI, IoT, and blockchain.",
        registration_url: "https://itc.edu.kh/techsummit",
        max_participants: 800,
        is_published: true,
        is_featured: true,
      },
      {
        university_id: norton,
        title: "Norton Hackathon 2026",
        type: "competition",
        event_date: new Date("2026-04-05 08:00:00"),
        end_date: new Date("2026-04-06 20:00:00"),
        location: "Norton IT Innovation Lab",
        description:
          "48-hour hackathon open to all university students in Cambodia. Win prizes and get noticed by top tech employers.",
        registration_url: "https://norton.edu.kh/hackathon",
        max_participants: 200,
        is_published: true,
        is_featured: true,
      },
      {
        university_id: aupp,
        title: "AUPP Graduation Ceremony 2026",
        type: "graduation",
        event_date: new Date("2026-06-01 09:00:00"),
        end_date: new Date("2026-06-01 13:00:00"),
        location: "Sokha Phnom Penh Hotel & Convention",
        description:
          "Join us in celebrating the achievements of the Class of 2026. Family and friends are welcome.",
        registration_url: null,
        max_participants: 1000,
        is_published: true,
        is_featured: true,
      },
      {
        university_id: puc,
        title: "Tourism & Hospitality Career Fair",
        type: "other",
        event_date: new Date("2026-04-22 09:00:00"),
        end_date: new Date("2026-04-22 16:00:00"),
        location: "PUC Main Campus",
        description:
          "Connect with top employers in tourism, hospitality, and travel. Bring your CV for on-site interviews.",
        registration_url: null,
        max_participants: 300,
        is_published: true,
        is_featured: false,
      },
    ];
    const curatedEventUniversityIds = new Set(
      events.map((e) => e.university_id).filter(Boolean),
    );
    const generatedEvents = unis
      .filter((uni) => !curatedEventUniversityIds.has(uni.id))
      .flatMap((uni, index) => ([
        {
          university_id: uni.id,
          title: `${uni.name} Information Session 2026`,
          type: "open_day",
          event_date: new Date("2026-04-18 08:00:00"),
          end_date: new Date("2026-04-18 12:00:00"),
          location: `${uni.name} Campus${uni.province ? `, ${uni.province}` : ""}`,
          description: `Meet the admissions team at ${uni.name}, explore academic programs, and learn about application steps, scholarships, and campus life for the 2026 intake.`,
          registration_url: uni.website_url || null,
          max_participants: 250 + index * 10,
          is_published: true,
          is_featured: index < 8,
        },
        {
          university_id: uni.id,
          title: `${uni.name} Student Orientation and Academic Planning Workshop`,
          type: "workshop",
          event_date: new Date("2026-05-12 09:00:00"),
          end_date: new Date("2026-05-12 15:00:00"),
          location: `${uni.name}${uni.province ? `, ${uni.province}` : ""}`,
          description: `A practical workshop covering program selection, study planning, student services, and transition tips for new and continuing students at ${uni.name}.`,
          registration_url: uni.website_url || null,
          max_participants: 180 + index * 6,
          is_published: true,
          is_featured: false,
        },
      ]));
    const eventsToInsert = [...events, ...generatedEvents]
      .filter((e) => e.university_id)
      .map((e) => {
        const fallbackImage = createContentImage(
          e.title,
          e.type ? String(e.type).replace(/_/g, " ") : "Event",
          e.location || e.description || "Campus event",
        );
        return {
          id: randomUUID(),
          meeting_url: null,
          registration_deadline: null,
          is_online: false,
          cover_url: e.cover_url || fallbackImage,
          image_urls:
            Array.isArray(e.image_urls) && e.image_urls.length
              ? e.image_urls
              : [e.cover_url || fallbackImage],
          ...e,
          created_at: now,
          updated_at: now,
        };
      });
    await queryInterface.bulkInsert("university_events", eventsToInsert, {
      ignoreDuplicates: true,
    });

    // ── UniversityTestimonials ────────────────────────────────────────────────
    const testimonials = [
      {
        university_id: rupp,
        name: "Srey Leak Heng",
        role: "Computer Science Graduate, 2024",
        graduation_year: 2024,
        content:
          "RUPP gave me a solid foundation in computer science. The professors are knowledgeable and the campus atmosphere is motivating. I landed a job at a tech company within 3 months of graduating.",
        rating: 5,
        is_featured: true,
        is_approved: true,
      },
      {
        university_id: rupp,
        name: "Vibol Chea",
        role: "Business Student, Year 3",
        graduation_year: null,
        content:
          "The business faculty at RUPP is excellent. The curriculum is updated regularly and we get real-world case studies. The library resources are also very helpful for research.",
        rating: 4,
        is_featured: false,
        is_approved: true,
      },
      {
        university_id: itc,
        name: "Dara Pich",
        role: "Electrical Engineering Graduate",
        graduation_year: 2023,
        content:
          "ITC prepared me for real engineering challenges. The practical labs and industry connections helped me secure a job even before graduation. Highly recommend for STEM students.",
        rating: 5,
        is_featured: true,
        is_approved: true,
      },
      {
        university_id: norton,
        name: "Sokha Mao",
        role: "IT Graduate, 2024",
        graduation_year: 2024,
        content:
          "Norton has modern facilities and the IT courses are very practical. The instructors have industry experience which makes learning much more relevant. Good value for money.",
        rating: 4,
        is_featured: true,
        is_approved: true,
      },
      {
        university_id: puc,
        name: "Channary Ros",
        role: "Tourism Management Student",
        graduation_year: null,
        content:
          "PUC offers great exposure to the tourism industry through internship placements and guest lectures from hotel industry professionals. The English-medium instruction is a big plus.",
        rating: 4,
        is_featured: true,
        is_approved: true,
      },
      {
        university_id: aupp,
        name: "Kevin Phon",
        role: "Business Graduate, Class of 2024",
        graduation_year: 2024,
        content:
          "The American-style education at AUPP is truly world-class. Small class sizes mean you get personal attention from professors. The alumni network has been invaluable in my career.",
        rating: 5,
        is_featured: true,
        is_approved: true,
      },
    ];
    const curatedTestimonialUniversityIds = new Set(
      testimonials.map((t) => t.university_id).filter(Boolean),
    );
    const testimonialNames = [
      "Sokunthea Chhim",
      "Vicheka Lim",
      "Ratha Chan",
      "Dalin Yim",
      "Borey Khun",
      "Malis Ouk",
      "Sophea Nhem",
      "Pheaktra Long",
    ];
    const generatedTestimonials = unis
      .filter((uni) => !curatedTestimonialUniversityIds.has(uni.id))
      .flatMap((uni, index) => ([
        {
          university_id: uni.id,
          name: testimonialNames[index % testimonialNames.length],
          role:
            uni.type === "private"
              ? "Undergraduate Student"
              : "Graduate Student",
          graduation_year: index % 2 === 0 ? 2025 : null,
          content: `${uni.name} gave me a supportive learning environment, approachable lecturers, and useful campus services. I especially appreciated the balance between classroom learning and practical opportunities that helped me feel more prepared for my next step.`,
          rating: 4 + (index % 2),
          is_featured: index < 10,
          is_approved: true,
        },
        {
          university_id: uni.id,
          name: testimonialNames[(index + 3) % testimonialNames.length],
          role: "Recent Graduate",
          graduation_year: 2024,
          content: `My experience at ${uni.name} helped me build confidence through coursework, campus support, and collaboration with classmates. The academic structure and student services made it easier to plan for internships and future career opportunities.`,
          rating: 4,
          is_featured: false,
          is_approved: true,
        },
      ]));
    const testimonialsToInsert = [...testimonials, ...generatedTestimonials]
      .filter((t) => t.university_id)
      .map((t) => ({
        id: randomUUID(),
        user_id: null,
        avatar_url: null,
        ...t,
        created_at: now,
        updated_at: now,
      }));
    await queryInterface.bulkInsert(
      "university_testimonials",
      testimonialsToInsert,
      { ignoreDuplicates: true },
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("university_testimonials", null, {});
    await queryInterface.bulkDelete("university_events", null, {});
    await queryInterface.bulkDelete("university_news", null, {});
    await queryInterface.bulkDelete("university_faqs", null, {});
    await queryInterface.bulkDelete("admission_requirements", null, {});
    await queryInterface.bulkDelete("campus_facilities", null, {});
    await queryInterface.bulkDelete("university_contacts", null, {});
  },
};
