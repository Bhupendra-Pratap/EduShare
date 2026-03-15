import { PrismaClient, Role, VerificationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Super Admin
  const superAdminPass = await bcrypt.hash("superadmin123", 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@edushare.com" },
    update: {},
    create: {
      email: "superadmin@edushare.com",
      name: "Super Admin",
      password: superAdminPass,
      role: Role.SUPER_ADMIN,
      verificationStatus: VerificationStatus.APPROVED,
    },
  });

  // Institution
  const institution = await prisma.institution.upsert({
    where: { code: "IIT-DELHI" },
    update: {},
    create: {
      name: "Indian Institute of Technology Delhi",
      code: "IIT-DELHI",
      description: "Premier technical institution in India",
      address: "Hauz Khas, New Delhi 110016",
      website: "https://iitd.ac.in",
    },
  });

  // Admin for institution
  const adminPass = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@iitd.ac.in" },
    update: {},
    create: {
      email: "admin@iitd.ac.in",
      name: "IIT Delhi Admin",
      password: adminPass,
      role: Role.ADMIN,
      institutionId: institution.id,
      verificationStatus: VerificationStatus.APPROVED,
    },
  });

  await prisma.institution.update({
    where: { id: institution.id },
    data: { adminId: admin.id },
  });

  // Department
  const dept = await prisma.department.upsert({
    where: { code_institutionId: { code: "CSE", institutionId: institution.id } },
    update: {},
    create: {
      name: "Computer Science & Engineering",
      code: "CSE",
      institutionId: institution.id,
    },
  });

  // Year Groups
  const year1 = await prisma.yearGroup.create({
    data: { label: "1st Year", yearNumber: 1, departmentId: dept.id },
  }).catch(() => prisma.yearGroup.findFirst({ where: { yearNumber: 1, departmentId: dept.id } }));

  const year2 = await prisma.yearGroup.create({
    data: { label: "2nd Year", yearNumber: 2, departmentId: dept.id },
  }).catch(() => prisma.yearGroup.findFirst({ where: { yearNumber: 2, departmentId: dept.id } }));

  // Subjects
  const dsa = await prisma.subject.create({
    data: {
      name: "Data Structures & Algorithms",
      code: "CS201",
      description: "Core DSA concepts",
      yearGroupId: year1!.id,
    },
  }).catch(() => prisma.subject.findFirst({ where: { code: "CS201" } }));

  const dbms = await prisma.subject.create({
    data: {
      name: "Database Management Systems",
      code: "CS301",
      description: "DBMS fundamentals",
      yearGroupId: year2!.id,
    },
  }).catch(() => prisma.subject.findFirst({ where: { code: "CS301" } }));

  // Topics
  if (dsa) {
    await prisma.topic.createMany({
      data: [
        { name: "Arrays & Strings", subjectId: dsa.id },
        { name: "Linked Lists", subjectId: dsa.id },
        { name: "Trees & Graphs", subjectId: dsa.id },
        { name: "Dynamic Programming", subjectId: dsa.id },
        { name: "Sorting Algorithms", subjectId: dsa.id },
      ],
      skipDuplicates: true,
    });
  }

  if (dbms) {
    await prisma.topic.createMany({
      data: [
        { name: "ER Diagrams", subjectId: dbms.id },
        { name: "Normalization", subjectId: dbms.id },
        { name: "SQL Queries", subjectId: dbms.id },
        { name: "Transactions", subjectId: dbms.id },
      ],
      skipDuplicates: true,
    });
  }

  // Teacher
  const teacherPass = await bcrypt.hash("teacher123", 12);
  await prisma.user.upsert({
    where: { email: "prof.sharma@iitd.ac.in" },
    update: {},
    create: {
      email: "prof.sharma@iitd.ac.in",
      name: "Prof. Rajesh Sharma",
      password: teacherPass,
      role: Role.TEACHER,
      institutionId: institution.id,
      departmentId: dept.id,
      verificationStatus: VerificationStatus.APPROVED,
    },
  });

  // Student
  const studentPass = await bcrypt.hash("student123", 12);
  await prisma.user.upsert({
    where: { email: "student@iitd.ac.in" },
    update: {},
    create: {
      email: "student@iitd.ac.in",
      name: "Arjun Mehta",
      password: studentPass,
      role: Role.STUDENT,
      institutionId: institution.id,
      departmentId: dept.id,
      yearGroup: "1",
      verificationStatus: VerificationStatus.APPROVED,
    },
  });

  console.log("✅ Seed complete!");
  console.log("\n📋 Demo Accounts:");
  console.log("  Super Admin: superadmin@edushare.com / superadmin123");
  console.log("  Admin:       admin@iitd.ac.in / admin123");
  console.log("  Teacher:     prof.sharma@iitd.ac.in / teacher123");
  console.log("  Student:     student@iitd.ac.in / student123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
