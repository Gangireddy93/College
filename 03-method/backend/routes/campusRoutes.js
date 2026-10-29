const express = require("express");
const router = express.Router();

// Campus data covering placements, sports, clubs, announcements, and high-res campus gallery
const CAMPUS_DATA = {
  placements: {
    stats: {
      highestPackage: "₹44.5 LPA",
      highestCompany: "Amazon / Microsoft",
      averagePackage: "₹8.4 LPA",
      placementRate: "95.2%",
      totalOffers: 1420,
      totalRecruiters: 120,
    },
    topRecruiters: [
      { name: "Google", logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=60", package: "₹42 LPA", tier: "Dream" },
      { name: "Microsoft", logo: "https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?w=100&auto=format&fit=crop&q=60", package: "₹44.5 LPA", tier: "Dream" },
      { name: "Amazon", logo: "https://images.unsplash.com/photo-1523474253246-605e552719c8?w=100&auto=format&fit=crop&q=60", package: "₹38 LPA", tier: "Dream" },
      { name: "TCS Digital", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60", package: "₹9.5 LPA", tier: "Super Dream" },
      { name: "Infosys DSE", logo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&auto=format&fit=crop&q=60", package: "₹8.0 LPA", tier: "Super Dream" },
      { name: "Cognizant GenC Next", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60", package: "₹7.5 LPA", tier: "Premier" },
      { name: "Deloitte USI", logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60", package: "₹10.5 LPA", tier: "Super Dream" },
      { name: "Larsen & Toubro (L&T)", logo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&auto=format&fit=crop&q=60", package: "₹7.2 LPA", tier: "Core Engineering" },
    ],
    activeDrives: [
      {
        company: "Accenture Technologies",
        role: "Associate Software Engineer",
        package: "₹6.5 LPA - ₹8.5 LPA",
        eligibleBranches: "CSE, CSE-AI, Cyber, DS, ECE, EEE",
        driveDate: "24th Oct 2026",
        venue: "Central Auditorium & Online Assessment",
        status: "Applications Open",
      },
      {
        company: "Qualcomm India",
        role: "Hardware & Embedded Systems Engineer",
        package: "₹16.0 LPA",
        eligibleBranches: "ECE, EEE",
        driveDate: "28th Oct 2026",
        venue: "VLSI Center of Excellence, Block B",
        status: "Shortlisting",
      },
      {
        company: "Tata Motors & L&T Heavy Civil",
        role: "Graduate Engineer Trainee (GET)",
        package: "₹7.0 LPA",
        eligibleBranches: "Mechanical, Civil Engineering",
        driveDate: "02nd Nov 2026",
        venue: "Mechanical CAD Lab, Block C",
        status: "Upcoming",
      },
    ],
  },
  sports: {
    upcomingEvents: [
      {
        name: "Inter-Department Cricket Premier League (CPL 2026)",
        category: "Cricket",
        date: "25th - 30th Oct 2026",
        ground: "Main Sports Stadium",
        teams: "8 Department Teams (CSE, ECE, Mech, Civil, etc.)",
        prize: "₹50,000 + Champions Trophy",
      },
      {
        name: "State-Level Basketball & Volleyball Championship",
        category: "Basketball",
        date: "05th - 07th Nov 2026",
        ground: "Floodlit Synthetic Courts",
        teams: "16 University Teams",
        prize: "Gold & Silver Medals + Cash Awards",
      },
      {
        name: "Annual Badminton & Table Tennis Tournament",
        category: "Indoor Sports",
        date: "12th Nov 2026",
        ground: "Indoor Sports Complex (Wooden Court)",
        teams: "Men & Women Singles / Doubles",
        prize: "Trophies & Merit Certificates",
      },
    ],
    achievements: [
      { title: "Gold Medal in State Inter-University Athletic Meet (400m)", winner: "Karthik Gowda (3rd Year CSE)", year: "2026" },
      { title: "Runners-Up Trophy — Zonal Football Championship", winner: "College Football Varsity Team", year: "2026" },
      { title: "Champions — Inter-Collegiate Chess Tournament", winner: "Ananya Shetty (2nd Year ECE)", year: "2026" },
    ],
  },
  clubs: [
    {
      name: "Google Developer Student Club (GDSC) & Coding Hub",
      category: "Technical",
      icon: "Code",
      membersCount: 380,
      lead: "Aarav Sharma & Team",
      activities: "Weekly LeetCode Sprints, Hackathons, Open-source contributions, Cloud workshops.",
      upcomingEvent: "48-Hour Hackathon: Build with AI — 15th Nov 2026",
    },
    {
      name: "Robotics & Embedded Systems Club",
      category: "Technical",
      icon: "Cpu",
      membersCount: 220,
      lead: "Dr. K. Srinivas & Student Leads",
      activities: "Drone design, Line-follower bots, IoT smart agriculture prototypes, ROS development.",
      upcomingEvent: "Robo-War & Drone Racing Arena — 20th Nov 2026",
    },
    {
      name: "Cultural, Music & Arts Society (TARANG)",
      category: "Cultural",
      icon: "Music",
      membersCount: 450,
      lead: "Keerthana Raju & Council",
      activities: "College Rock Band, Classical & Western Dance, Theatre & Drama fests, Photography.",
      upcomingEvent: "Annual Cultural Fest & Star Night — Dec 2026",
    },
    {
      name: "National Service Scheme (NSS) & Green Campus",
      category: "Social Service",
      icon: "Heart",
      membersCount: 310,
      lead: "Prof. Anitha & NSS Volunteers",
      activities: "Mega Blood Donation Camp, Tree Plantation, Rural Digital Literacy Camps.",
      upcomingEvent: "Health & Eye Checkup Camp — 29th Oct 2026",
    },
  ],
  announcements: [
    {
      id: 1,
      title: "Semester End Theory Examination Admit Cards Released",
      category: "Exams",
      date: "Today, 10:00 AM",
      priority: "urgent",
      message: "Admit cards for 1st, 2nd, 3rd, and 4th year regular & supplementary examinations are active for download in student portal.",
    },
    {
      id: 2,
      title: "Strict Anti-Cheat Seating Matrix Enforced",
      category: "Exam Cell",
      date: "Yesterday",
      priority: "important",
      message: "Desks are mapped column-wise with alternating branch pairs. Mobile phones and smart watches are strictly prohibited in exam halls.",
    },
    {
      id: 3,
      title: "Library Reading Rooms Open 24/7 during Exam Period",
      category: "Academic",
      date: "2 days ago",
      priority: "info",
      message: "Central digital library and reading halls will remain open 24 hours with high-speed Wi-Fi and study cubicles.",
    },
    {
      id: 4,
      title: "Pre-Placement Training & Mock Coding Rounds for 3rd & 4th Years",
      category: "Placements",
      date: "3 days ago",
      priority: "info",
      message: "Special sessions on System Design, LeetCode Hard problems, and HR Mock Interviews start every evening from 4:30 PM.",
    },
  ],
  gallery: [
    {
      title: "Majestic Main Administrative & Academic Block",
      category: "Campus Architecture",
      imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80",
      description: "State-of-the-art autonomous campus spread across lush green 45 acres.",
    },
    {
      title: "Modern Central Digital Library & Research Wing",
      category: "Academic Facilities",
      imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80",
      description: "Over 85,000 titles, IEEE digital access, and air-conditioned quiet study zones.",
    },
    {
      title: "High-Performance Computing & AI Labs",
      category: "Laboratories",
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&auto=format&fit=crop&q=80",
      description: "Dedicated GPU clusters, Apple Mac labs, and robotics prototyping setups.",
    },
    {
      title: "Olympic Standard Sports Stadium & Floodlit Courts",
      category: "Sports & Athletics",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
      description: "Cricket pitch, basketball courts, synthetic running tracks, and gymnasiums.",
    },
    {
      title: "Grand Indoor Convention Center & Auditorium",
      category: "Events & Fests",
      imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
      description: "2,500-seat acoustic auditorium for international conferences, hackathons, and cultural fests.",
    },
    {
      title: "Annual Convocation & Graduation Ceremony",
      category: "Student Milestones",
      imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
      description: "Celebrating academic excellence and welcoming industry leaders to honor graduating batches.",
    },
  ],
};

router.get("/", (req, res) => {
  res.json({
    success: true,
    campus: CAMPUS_DATA,
  });
});

module.exports = router;
