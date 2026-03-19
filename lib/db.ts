import mysql from 'mysql2/promise';

// Configura a conexão apontando para o seu banco de dados externo/existente
export const dbPool = mysql.createPool({
  host: '10.136.100.30', 
  port: 3306,
  user: 'java_leitor', 
  password: 'dados13245',
  database: 'dados_agrupados',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// A Tool que a IA vai chamar
export async function executarQuerySQL(query: string) {
  try {
    const [rows] = await dbPool.execute(query);
    return rows; 
  } catch (error: any) {
    console.error("Erro do banco:", error.message);
    return { erro: `Erro na query: ${error.message}` };
  }
}