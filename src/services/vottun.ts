interface VottunCredentials {
  apiKey: string;
  appId: string;
  wallet: string;
}

interface VottunRequestConfig {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

export class VottunService {
  private static BASE_URL = 'https://api.vottun.tech';
  private credentials: VottunCredentials;

  constructor(credentials: VottunCredentials) {
    this.credentials = credentials;
    this.validateCredentials();
  }

  private validateCredentials() {
    if (!this.credentials.apiKey) {
      console.warn('API Key no proporcionada. Las peticiones a Vottun API fallarán con error 401.');
    }
    if (!this.credentials.appId) {
      console.warn('App ID no proporcionado. Las peticiones a Vottun API fallarán con error 401.');
    }
  }

  async makeRequest({ endpoint, method = 'GET', body }: VottunRequestConfig) {
    // Validar credenciales antes de hacer la petición
    if (!this.credentials.apiKey || !this.credentials.appId) {
      throw new Error('Credenciales incompletas: API Key y App ID son obligatorios para hacer peticiones a Vottun API');
    }

    // Headers según la documentación oficial de Vottun
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.credentials.apiKey}`,
      'x-application-vkn': this.credentials.appId
    };

    try {
      console.log(`Realizando petición a ${endpoint} con método ${method}`);
      
      // Procesar parámetros dinámicos en la URL
      let processedEndpoint = endpoint;
      
      // Reemplazar {account} con la dirección de wallet apropiada
      if (processedEndpoint.includes('{account}')) {
        // Si hay un campo 'account' en el body, usarlo primero
        if (body && 'account' in body && body.account) {
          const accountValue = body.account;
          processedEndpoint = processedEndpoint.replace('{account}', accountValue);
          
          // Eliminar el campo account del body para evitar duplicación en los query params
          if (typeof body === 'object') {
            const newBody = { ...body };
            delete newBody.account;
            body = Object.keys(newBody).length > 0 ? newBody : undefined;
          }
        } 
        // Si no hay account en el body, usar la wallet de las credenciales
        else if (this.credentials.wallet) {
          processedEndpoint = processedEndpoint.replace('{account}', this.credentials.wallet);
        }
        // Si no hay ninguna wallet disponible, lanzar error
        else {
          throw new Error('Se requiere una dirección de wallet para este endpoint. Proporciona el campo "account" o configura una wallet en las credenciales.');
        }
        console.log(`Endpoint con parámetros reemplazados: ${processedEndpoint}`);
      }
      
      // Construir la URL completa
      let url = `${VottunService.BASE_URL}${processedEndpoint}`;
      
      // Si es un método GET y hay body, convertirlo en parámetros de consulta
      if (method === 'GET' && body && Object.keys(body).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(body).forEach(([key, value]) => {
          queryParams.append(key, String(value));
        });
        url += `?${queryParams.toString()}`;
        console.log(`URL con parámetros de consulta: ${url}`);
        // No enviar body en peticiones GET
        body = undefined;
      }
      
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      // Clonar la respuesta para poder leerla múltiples veces si es necesario
      const responseClone = response.clone();

      if (!response.ok) {
        // Intentar obtener más información del error
        let errorDetail = '';
        try {
          const errorData = await responseClone.json().catch(() => null);
          if (errorData) {
            errorDetail = JSON.stringify(errorData);
          } else {
            errorDetail = await responseClone.text().catch(() => 'No se pudo leer el detalle del error');
          }
        } catch (e) {
          errorDetail = 'No se pudo leer el detalle del error';
        }

        // Mensajes de error específicos según el código de estado
        if (response.status === 401) {
          throw new Error(`Error de autenticación (401): Verifica que tu API Key y App ID sean correctos. Detalles: ${errorDetail}`);
        } else if (response.status === 403) {
          throw new Error(`Error de permisos (403): No tienes permisos para acceder a este recurso. Detalles: ${errorDetail}`);
        } else if (response.status === 404) {
          throw new Error(`Recurso no encontrado (404): El endpoint ${endpoint} no existe. Detalles: ${errorDetail}`);
        } else {
          throw new Error(`Error HTTP: ${response.status}. Detalles: ${errorDetail}`);
        }
      }

      // Intentar parsear la respuesta como JSON
      try {
        return await response.json();
      } catch (error) {
        console.warn('La respuesta no es un JSON válido, devolviendo texto');
        return { text: await responseClone.text() };
      }
    } catch (error) {
      // Capturar errores de red u otros errores no relacionados con la respuesta HTTP
      if (error instanceof Error) {
        console.error('Error en la petición a Vottun API:', error.message);
        throw error;
      }
      throw new Error(`Error desconocido al realizar la petición: ${String(error)}`);
    }
  }

  // Example endpoint methods
  async getBalance() {
    return this.makeRequest({
      endpoint: '/v1/wallet/balance',
      method: 'POST',
      body: {
        wallet: this.credentials.wallet,
      },
    });
  }

  // Add more endpoint methods as needed
}
