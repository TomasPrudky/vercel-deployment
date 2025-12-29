// Centralized error handling utility

export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

export const getErrorType = (error) => {
  if (!error) return ErrorTypes.UNKNOWN;

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ErrorTypes.TIMEOUT;
  }

  if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
    return ErrorTypes.NETWORK;
  }

  if (error.response) {
    return ErrorTypes.API;
  }

  return ErrorTypes.UNKNOWN;
};

export const getErrorMessage = (error) => {
  const errorType = getErrorType(error);

  switch (errorType) {
    case ErrorTypes.NETWORK:
      return 'Unable to connect. Please check your internet connection.';
    case ErrorTypes.TIMEOUT:
      return 'Request timed out. Please try again.';
    case ErrorTypes.API:
      const status = error.response?.status;
      if (status === 404) return 'Data not found.';
      if (status === 500) return 'Server error. Please try again later.';
      if (status === 503) return 'Service temporarily unavailable.';
      return `Server returned error (${status}).`;
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

export const logError = (context, error) => {
  const errorType = getErrorType(error);
  const timestamp = new Date().toISOString();

  console.error(`[${timestamp}] [${context}] ${errorType}:`, {
    message: error.message,
    status: error.response?.status,
    url: error.config?.url,
    stack: error.stack
  });
};
