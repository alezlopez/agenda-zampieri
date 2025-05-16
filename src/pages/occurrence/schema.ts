
import { z } from "zod";

export const occurrenceSchema = z.object({
  disciplina: z.string().min(1, "Selecione uma disciplina"),
  nome_aluno: z.string().min(1, "Nome do aluno é obrigatório"),
  tipo_ocorrencia: z.string().min(1, "Selecione um tipo de ocorrência"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
});
