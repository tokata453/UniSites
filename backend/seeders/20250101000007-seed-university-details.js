"use strict";
const { randomUUID } = require("crypto");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const unis = await queryInterface.sequelize.query(
      `SELECT id, slug FROM universities`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    const uniMap = Object.fromEntries(unis.map((u) => [u.slug, u.id]));

    const rupp = uniMap["royal-university-of-phnom-penh"];
    const itc = uniMap["institute-of-technology-of-cambodia"];
    const norton = uniMap["norton-university"];
    const puc = uniMap["paññasastra-university-of-cambodia"];
    const aupp = uniMap["american-university-of-phnom-penh"];
    const allIds = [rupp, itc, norton, puc, aupp].filter(Boolean);

    // ── UniversityContact ─────────────────────────────────────────────────────
    const contacts = [
      {
        id: randomUUID(),
        university_id: rupp,
        admission_email: "admission@rupp.edu.kh",
        admission_phone: "+855 23 880 116",
        general_email: "info@rupp.edu.kh",
        general_phone: "+855 23 880 116",
        facebook_page: "https://facebook.com/rupp.edu.kh",
        office_hours: "Mon-Fri 7:30am - 5:00pm",
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        university_id: itc,
        admission_email: "admission@itc.edu.kh",
        admission_phone: "+855 23 880 370",
        general_email: "info@itc.edu.kh",
        general_phone: "+855 23 880 370",
        facebook_page: "https://facebook.com/itc.edu.kh",
        office_hours: "Mon-Fri 7:30am - 5:30pm",
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        university_id: norton,
        admission_email: "info@norton.edu.kh",
        admission_phone: "+855 23 987 701",
        general_email: "info@norton.edu.kh",
        general_phone: "+855 23 987 701",
        facebook_page: "https://facebook.com/nortonuniversity",
        office_hours: "Mon-Sat 7:30am - 6:00pm",
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        university_id: puc,
        admission_email: "admissions@puc.edu.kh",
        admission_phone: "+855 23 990 153",
        general_email: "info@puc.edu.kh",
        general_phone: "+855 23 990 153",
        facebook_page: "https://facebook.com/PUCambodia",
        office_hours: "Mon-Fri 8:00am - 5:00pm",
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        university_id: aupp,
        admission_email: "admissions@aupp.edu.kh",
        admission_phone: "+855 23 969 248",
        general_email: "info@aupp.edu.kh",
        general_phone: "+855 23 969 248",
        facebook_page: "https://facebook.com/AUPPCambodia",
        office_hours: "Mon-Fri 8:00am - 5:30pm",
        created_at: now,
        updated_at: now,
      },
    ].filter((c) => c.university_id);
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
    const newsToInsert = newsItems
      .filter((n) => n.university_id)
      .map((n) => ({
        id: randomUUID(),
        author_id: null,
        ...n,
        created_at: now,
        updated_at: now,
      }));
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
    const eventsToInsert = events
      .filter((e) => e.university_id)
      .map((e) => ({
        id: randomUUID(),
        meeting_url: null,
        registration_deadline: null,
        is_online: false,
        ...e,
        created_at: now,
        updated_at: now,
      }));
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
    const testimonialsToInsert = testimonials
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
