
// URL for the webhook to send occurrences
export const WEBHOOK_URL = "https://n8n.colegiozampieri.com/webhook/agendadigital2";

/**
 * Sends occurrence data to the webhook with timeout and retry capabilities
 */
export const sendOccurrenceData = async (payload: any, attemptNumber: number = 1, maxRetries: number = 2): Promise<boolean> => {
  try {
    console.log(`Attempt ${attemptNumber} for occurrence submission`);
    
    // Configurando um timeout de 15 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Erro de servidor: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao enviar formulário:", error);
    
    if (attemptNumber < maxRetries) {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Retry attempt ${attemptNumber + 1} for occurrence submission`);
      return sendOccurrenceData(payload, attemptNumber + 1, maxRetries);
    }
    
    throw error;
  }
};
