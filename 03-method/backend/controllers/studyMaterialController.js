const StudyMaterial = require("../models/StudyMaterial");

// Initial sample materials covering all 4 years and 8 semesters
const DEFAULT_MATERIALS = [
  // 1st Year - Semester 1
  {
    title: "Engineering Mathematics-I Complete Lecture Notes",
    academicYear: "1st Year",
    semester: "Semester 1",
    branch: "All Branches",
    subject: "Engineering Mathematics-I",
    materialType: "Lecture Notes",
    fileUrl: "https://example.com/materials/math1_notes.pdf",
    description: "Covers Differential Calculus, Matrices, Infinite Series, and Partial Differentiation with solved step-by-step problems.",
    fileSize: "4.8 MB",
    downloads: 142,
  },
  {
    title: "Communicative English & Technical Vocabulary Question Bank",
    academicYear: "1st Year",
    semester: "Semester 1",
    branch: "All Branches",
    subject: "Communicative English",
    materialType: "Question Bank",
    fileUrl: "https://example.com/materials/english_qb.pdf",
    description: "Grammar, Letter Writing, Technical Reports, and previous 5 years university exam questions.",
    fileSize: "2.1 MB",
    downloads: 98,
  },
  {
    title: "Engineering Physics & Lab Manual",
    academicYear: "1st Year",
    semester: "Semester 1",
    branch: "All Branches",
    subject: "Engineering Physics",
    materialType: "Lab Manual",
    fileUrl: "https://example.com/materials/physics_lab.pdf",
    description: "Complete laboratory experiments, formulas, circuit diagrams, and viva-voce questions.",
    fileSize: "5.4 MB",
    downloads: 110,
  },

  // 1st Year - Semester 2
  {
    title: "Data Structures & C Programming Guide",
    academicYear: "1st Year",
    semester: "Semester 2",
    branch: "Computer Science & Engineering (CSE)",
    subject: "Data Structures",
    materialType: "Lecture Notes",
    fileUrl: "https://example.com/materials/ds_notes.pdf",
    description: "Arrays, Linked Lists, Stacks, Queues, Trees, Binary Search, Graphs and Sorting algorithms.",
    fileSize: "6.2 MB",
    downloads: 235,
  },
  {
    title: "Basic Electrical & Electronics Engineering Formula Sheet",
    academicYear: "1st Year",
    semester: "Semester 2",
    branch: "Electrical & Electronics Engineering (EEE)",
    subject: "Basic Electrical Engineering",
    materialType: "Lecture Notes",
    fileUrl: "https://example.com/materials/bee_formulas.pdf",
    description: "Ohm's Law, KCL/KVL, AC Circuits, Transformers, and DC Machines summary sheets.",
    fileSize: "3.1 MB",
    downloads: 87,
  },
  {
    title: "Engineering Chemistry & Environmental Science PYQs",
    academicYear: "1st Year",
    semester: "Semester 2",
    branch: "All Branches",
    subject: "Engineering Chemistry",
    materialType: "Previous Question Papers (PYQ)",
    fileUrl: "https://example.com/materials/chem_pyq.pdf",
    description: "Past 4 years solved university examination papers with answer keys.",
    fileSize: "3.9 MB",
    downloads: 76,
  },

  // 2nd Year - Semester 3
  {
    title: "Object-Oriented Programming with Java & C++",
    academicYear: "2nd Year",
    semester: "Semester 3",
    branch: "Computer Science & Engineering (CSE)",
    subject: "Object-Oriented Programming",
    materialType: "Lecture Notes",
    fileUrl: "https://example.com/materials/java_oop.pdf",
    description: "Inheritance, Polymorphism, Abstract classes, Interfaces, Exception handling, Multi-threading.",
    fileSize: "7.1 MB",
    downloads: 310,
  },
  {
    title: "Digital Logic Design & Microprocessor Architecture",
    academicYear: "2nd Year",
    semester: "Semester 3",
    branch: "Electronics & Communication Engineering (ECE)",
    subject: "Digital Logic Design",
    materialType: "Question Bank",
    fileUrl: "https://example.com/materials/dld_qb.pdf",
    description: "Boolean algebra, Karnaugh Maps, Combinational circuits, Sequential circuits, Flip-flops, Counters.",
    fileSize: "4.5 MB",
    downloads: 180,
  },

  // 2nd Year - Semester 4
  {
    title: "Database Management Systems (DBMS) Comprehensive Notes",
    academicYear: "2nd Year",
    semester: "Semester 4",
    branch: "Computer Science & Engineering (CSE)",
    subject: "Database Management Systems",
    materialType: "Lecture Notes",
    fileUrl: "https://example.com/materials/dbms_notes.pdf",
    description: "ER Diagrams, Relational Algebra, SQL queries, Normalization (1NF, 2NF, 3NF, BCNF), ACID properties.",
    fileSize: "8.3 MB",
    downloads: 412,
  },
  {
    title: "Signals & Systems Previous Exam Solved Papers",
    academicYear: "2nd Year",
    semester: "Semester 4",
    branch: "Electronics & Communication Engineering (ECE)",
    subject: "Signals & Systems",
    materialType: "Previous Question Papers (PYQ)",
    fileUrl: "https://example.com/materials/signals_pyq.pdf",
    description: "Fourier Transforms, Laplace Transforms, Z-Transforms, Linear Time-Invariant Systems.",
    fileSize: "5.0 MB",
    downloads: 165,
  },

  // 3rd Year - Semester 5
  {
    title: "Machine Learning & Neural Networks Complete Study Guide",
    academicYear: "3rd Year",
    semester: "Semester 5",
    branch: "Computer Science & Artificial Intelligence (CSE-AI)",
    subject: "Machine Learning",
    materialType: "Lecture Notes",
    fileUrl: "https://example.com/materials/ml_notes.pdf",
    description: "Supervised & Unsupervised Learning, Linear Regression, SVM, Decision Trees, Backpropagation, CNNs.",
    fileSize: "9.2 MB",
    downloads: 520,
  },
  {
    title: "Operating Systems & Concurrency Architecture",
    academicYear: "3rd Year",
    semester: "Semester 5",
    branch: "Computer Science & Engineering (CSE)",
    subject: "Operating Systems",
    materialType: "Lecture Notes",
    fileUrl: "https://example.com/materials/os_notes.pdf",
    description: "Process scheduling, CPU scheduling, Deadlocks, Virtual memory, Paging, Page replacement algorithms.",
    fileSize: "6.8 MB",
    downloads: 295,
  },

  // 3rd Year - Semester 6
  {
    title: "Network Security & Cryptography Handbook",
    academicYear: "3rd Year",
    semester: "Semester 6",
    branch: "Cyber Security",
    subject: "Network Security",
    materialType: "Lecture Notes",
    fileUrl: "https://example.com/materials/crypto_notes.pdf",
    description: "Symmetric & Asymmetric Encryption, RSA Algorithm, AES, SHA-256, Firewalls, Penetration Testing.",
    fileSize: "6.5 MB",
    downloads: 275,
  },
  {
    title: "Big Data Analytics & Hadoop Ecosystem Lab Manual",
    academicYear: "3rd Year",
    semester: "Semester 6",
    branch: "Data Sciences",
    subject: "Big Data Analytics",
    materialType: "Lab Manual",
    fileUrl: "https://example.com/materials/bigdata_lab.pdf",
    description: "HDFS, MapReduce, Apache Spark, Pig, Hive queries and data visualization pipelines.",
    fileSize: "7.8 MB",
    downloads: 210,
  },

  // 4th Year - Semester 7
  {
    title: "Cloud Computing & DevOps Practice Questions",
    academicYear: "4th Year",
    semester: "Semester 7",
    branch: "Computer Science & Engineering (CSE)",
    subject: "Cloud Computing",
    materialType: "Question Bank",
    fileUrl: "https://example.com/materials/cloud_qb.pdf",
    description: "AWS, Azure, Docker containers, Kubernetes, CI/CD pipelines, Microservices architecture.",
    fileSize: "5.7 MB",
    downloads: 380,
  },
  {
    title: "Deep Learning & Generative AI Research Papers & Notes",
    academicYear: "4th Year",
    semester: "Semester 7",
    branch: "Computer Science & Artificial Intelligence (CSE-AI)",
    subject: "Deep Learning",
    materialType: "Lecture Notes",
    fileUrl: "https://example.com/materials/deep_learning.pdf",
    description: "Transformers, Attention Mechanisms, BERT, GPT models, GANs, and Transfer Learning.",
    fileSize: "8.9 MB",
    downloads: 440,
  },

  // 4th Year - Semester 8
  {
    title: "Major Project Guidelines, Viva Preparation & Report Template",
    academicYear: "4th Year",
    semester: "Semester 8",
    branch: "All Branches",
    subject: "Capstone Major Project",
    materialType: "Syllabus & Curriculum",
    fileUrl: "https://example.com/materials/project_guidelines.pdf",
    description: "IEEE format report template, system design documentation, literature review, and defense viva questions.",
    fileSize: "3.2 MB",
    downloads: 650,
  },
  {
    title: "Campus Placement Technical Interview Question Bank (All Branches)",
    academicYear: "4th Year",
    semester: "Semester 8",
    branch: "All Branches",
    subject: "Campus Placements Preparation",
    materialType: "Question Bank",
    fileUrl: "https://example.com/materials/placement_prep.pdf",
    description: "Top 500 DSA questions, System Design fundamentals, Aptitude reasoning, and HR interview answers.",
    fileSize: "11.5 MB",
    downloads: 890,
  },
];

const seedInitialMaterials = async (collegeCode = "GIT") => {
  if (require("mongoose").connection.readyState !== 1) return;
  try {
    const count = await StudyMaterial.countDocuments({ collegeCode });
    if (count === 0) {
      const records = DEFAULT_MATERIALS.map((m) => ({ ...m, collegeCode }));
      await StudyMaterial.insertMany(records);
      console.log(`Seeded ${records.length} default study materials for college ${collegeCode}`);
    }
  } catch (err) {
    // ignore error
  }
};

require("mongoose").connection.on("connected", () => seedInitialMaterials("GIT"));

const getMaterials = async (req, res) => {
  try {
    const { academicYear, semester, branch, materialType, search, collegeCode = "GIT" } = req.query;
    const query = { collegeCode: String(collegeCode).toUpperCase() };

    if (academicYear && academicYear !== "All Years") {
      query.academicYear = { $in: [academicYear, "All Years"] };
    }
    if (semester && semester !== "All Semesters") {
      query.semester = semester;
    }
    if (branch && branch !== "All Branches") {
      query.branch = { $in: [branch, "All Branches"] };
    }
    if (materialType && materialType !== "All Types") {
      query.materialType = materialType;
    }
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    let materials = await StudyMaterial.find(query).sort({ academicYear: 1, semester: 1, createdAt: -1 });
    if (materials.length === 0 && !academicYear && !search) {
      // Auto re-seed if empty
      await seedInitialMaterials(collegeCode);
      materials = await StudyMaterial.find(query).sort({ academicYear: 1, semester: 1 });
    }

    res.json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addMaterial = async (req, res) => {
  try {
    const {
      title,
      academicYear,
      semester,
      branch,
      subject,
      materialType,
      fileUrl,
      description,
      fileSize,
      collegeCode = "GIT",
    } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ success: false, message: "Title and Subject are required" });
    }

    const material = new StudyMaterial({
      title: title.trim(),
      academicYear: academicYear || "1st Year",
      semester: semester || "Semester 1",
      branch: branch || "All Branches",
      subject: subject.trim(),
      materialType: materialType || "Lecture Notes",
      fileUrl: fileUrl || "https://example.com/materials/sample_notes.pdf",
      description: description || "",
      fileSize: fileSize || "4.0 MB",
      collegeCode: String(collegeCode).toUpperCase(),
      uploadedBy: req.user?.name || "Exam Department Admin",
    });

    await material.save();

    res.status(201).json({
      success: true,
      message: `Study material "${material.title}" added successfully for ${material.academicYear} (${material.semester})!`,
      material,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await StudyMaterial.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }
    res.json({
      success: true,
      message: `Deleted "${deleted.title}" successfully`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await StudyMaterial.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!material) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }
    res.json({
      success: true,
      message: `Download started for ${material.title}`,
      downloads: material.downloads,
      fileUrl: material.fileUrl,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getMaterials,
  addMaterial,
  deleteMaterial,
  downloadMaterial,
  seedInitialMaterials,
};
