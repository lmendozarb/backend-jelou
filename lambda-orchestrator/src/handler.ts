import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { OrchestratorService } from '../services/ochestrator.service';

export const createAndConfirmOrder: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    
    // Extraer JWT del header Authorization
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    const jwtToken = authHeader?.replace('Bearer ', '') || '';
    
    if (!jwtToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: 'Missing Authorization header' })
      };
    }
    
    const service = new OrchestratorService(jwtToken);
    const result = await service.execute(body);

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (e: any) {
    console.error(e);
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: e.message })
    };
  }
};