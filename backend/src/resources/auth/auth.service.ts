import prisma from '../../utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  // Verifica se já existe algum admin no banco
  async isSetupComplete() {
    const count = await prisma.administrador.count();
    return count > 0;
  }

  // Cria o PRIMEIRO administrador do sistema
  async setup(data: any) {
    const jaExiste = await this.isSetupComplete();
    if (jaExiste) throw new Error('O setup já foi realizado.');

    const senhaHash = await bcrypt.hash(data.senha, 10);

    return await prisma.administrador.create({
      data: {
        nome: data.nome,
        email: data.email,
        cargo: 'ADMIN_GERAL',
        municipio: data.municipio,
        senhaHash: senhaHash,
      }
    });
  }

  // Faz o login e devolve o Token
  async login(email: string, senha: string) {
    const admin = await prisma.administrador.findUnique({ where: { email } });
    if (!admin) throw new Error('Credenciais inválidas');

    const senhaValida = await bcrypt.compare(senha, admin.senhaHash);
    if (!senhaValida) throw new Error('Credenciais inválidas');

    if (!admin.ativo) throw new Error('Usuário inativo');

    const token = jwt.sign(
      { id: admin.id, cargo: admin.cargo }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '1d' }
    );

    return { token, admin: { nome: admin.nome, email: admin.email, cargo: admin.cargo } };
  }
}