
export interface Teacher {
  id: string;
  name: string;
  email: string;
}

export interface Discipline {
  id: string;
  nome: string;
}

export interface Class {
  id: string;
  nome: string;
}

export interface Student {
  id: string;
  codigo: string;
  nome: string;
  turma_id: string;
  curso?: string;
}

export const OccurrenceTypes = [
  'Acidente ou Ferimento',
  'Advertência Escolar',
  'Atrasado',
  'Baixo Rendimento Escolar',
  'Dano ao Patrimônio Escolar',
  'Desempenho Destacado',
  'Dificuldade no Aprendizado',
  'Entrega Atrasada de Atividades',
  'Indisciplina',
  'Mal-Estar'
] as const;

export type OccurrenceType = typeof OccurrenceTypes[number];
