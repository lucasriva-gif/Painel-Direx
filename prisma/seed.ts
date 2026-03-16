import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db"
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const senhaPadraoHash = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      name: "Administrador",
      passwordHash: senhaPadraoHash,
      role: "admin",
      paginas: ["home", "kanban", "todo", "projetos", "fluxogramas", "settings"],
      unidades: [],
      indicadores: [],
      avatar: "/avatars/avatar-01.png",
    },
  });

  await prisma.user.upsert({
    where: { username: "igor" },
    update: {},
    create: {
      username: "igor",
      name: "Igor Vinicius",
      passwordHash: senhaPadraoHash,
      role: "member",
      paginas: ["home", "kanban", "todo", "settings"],
      unidades: [],
      indicadores: [],
      avatar: "/avatars/avatar-02.png",
    },
  });

  const existingProject = await prisma.project.findFirst();

  if (!existingProject) {
    const project = await prisma.project.create({
      data: {
        name: "Squad Dados",
        description: "Kanban principal do time",
      },
    });

    const columns = await Promise.all([
      prisma.column.create({
        data: { title: "A Fazer", order: 1, projectId: project.id },
      }),
      prisma.column.create({
        data: { title: "Em Progresso", order: 2, projectId: project.id },
      }),
      prisma.column.create({
        data: { title: "Revisão de código", order: 3, projectId: project.id },
      }),
      prisma.column.create({
        data: { title: "Em teste", order: 4, projectId: project.id },
      }),
      prisma.column.create({
        data: { title: "Concluído", order: 5, projectId: project.id },
      }),
    ]);

    await prisma.task.createMany({
      data: [
        {
          title: "Criar Kanban",
          description: "Estruturar board do squad",
          priority: "LOW",
          assignee: "admin",
          order: 1,
          columnId: columns[0].id,
          projectId: project.id,
        },
        {
          title: "Criar login",
          description: "Sistema de autenticação",
          priority: "LOW",
          assignee: "igor",
          order: 2,
          columnId: columns[0].id,
          projectId: project.id,
        },
      ],
    });
  }

  console.log("Seed executado com sucesso.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });